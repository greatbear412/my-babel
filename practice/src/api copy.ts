import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EditResourceService } from '../../services/edit-resource.service';
import { BaseService } from '../../services/base.service';
import { NzMessageService } from 'ng-zorro-antd';
import { NzIconService } from 'ng-zorro-antd/icon';
import { Redmine } from '../../../assets/redmine';
import { Fxiaoke } from '../../../assets/fxiaoke';
import { LeftMenuService } from '../../services/left-menu.service';
import { forkJoin, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AsyncService } from '@app/utils/async.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
/**
 * 主页面
 */
export class DashboardComponent implements OnInit {
    isPermission: boolean = localStorage.getItem('rid') == '2';
    rid = localStorage.getItem('rid') !== '9';
    username = localStorage.getItem('name');
    status = true;
    isCollapsed = false;
    menuList = [];
    topMenuList = [];
    leftMenuSelectIndex: number;
    topMenuSelectIndex: number;
    isCurrentTopMenu: boolean = true;
    constructor(
        private _iconService: NzIconService,
        private baseService: BaseService,
        private router: Router,
        private editResourceService: EditResourceService,
        private message: NzMessageService,
        private leftMenuService: LeftMenuService,
        private asyncService: AsyncService
    ) {
        this._iconService.addIconLiteral('ng-zorro:Redmine', Redmine.logo);
        this._iconService.addIconLiteral('ng-zorro:Fxiaoke', Fxiaoke.logo);
    }

    ngOnInit() {
        setTimeout(() => this.isCollapsed = window.innerWidth < 1400);
        this.isPermission = localStorage.getItem('rid') == '2';
        this.baseService.httpSubject.subscribe({
            next: (val) => { this.status = val }
        });
        this.leftMenuService.getMenuDataList('topMenu').subscribe(res => {
            this.topMenuList = res;
            const queryAry = [];
            res.forEach(element => {
                queryAry.push(this.leftMenuService.getMenuDataList(element.type));
            });
            forkJoin(queryAry).subscribe(() => this.setMenuSelected());
        });

        this.setGlobalResizeSubscription();
    }

    setGlobalResizeSubscription() {
        this.asyncService.setSubscriber('windowResize');
        fromEvent(window, 'resize')
            .pipe(
                debounceTime(this.asyncService.resizeDebounceTime)
            )
            .subscribe(() => {
                this.asyncService.subjectObj['windowResize'].next();
            });
    }

    /**
       * 登出
       */
    signOut() {
        this.editResourceService.LoginOut().subscribe(res => {
            if (res['result'] == 200) {
                localStorage.clear();
                this.isPermission = false;
                this.message.success('登出成功！', {
                    nzDuration: 5000
                });
                this.router.navigate(['auth']);
            }
        });
    }

    getMenu(type: string) {
        if (this.topMenuSelectIndex === undefined) return;
        this.isCurrentTopMenu = type === this.topMenuList[this.topMenuSelectIndex]['type'];
        this.leftMenuService.getMenuDataList(type).subscribe(res => {
            this.menuList = res;
        });
    }

    setMenuSelected() {
        const location = this.router.url.split(';')[0];
        // 遍历找出对应菜单
        for (const k in this.leftMenuService.menu) {
            if (this.leftMenuService.menu.hasOwnProperty(k)) {
                if (k === 'topMenu') continue;
                const menuList = this.leftMenuService.menu[k].filter((item, index) => {
                    const i = item.list.findIndex(menuItem => {
                        return menuItem.link === location;
                    });
                    if (i > -1) {
                        this.leftMenuSelectIndex = index;
                        return true;
                    }
                    return false;
                });
                if (menuList.length) {
                    this.topMenuSelectIndex = Object.values(this.leftMenuService.menu['topMenu']).findIndex(item => item['type'] === k);
                    this.menuList = this.leftMenuService.menu[k];
                    break;
                }
            }
        }
        // 处于无对应菜单的路由时，设置默认状态
        if (this.topMenuSelectIndex === undefined) {
            this.topMenuSelectIndex = 0;
            this.leftMenuSelectIndex = 0;
            const defaultType = this.leftMenuService.menu['topMenu'][this.topMenuSelectIndex]['type'];
            this.menuList = this.leftMenuService.menu[defaultType];
        }
    }
}
