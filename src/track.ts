// import { Component, OnInit } from '@angular/core';
// import { PostContractService } from '../../post-contract.service';
// import { PostContractApiService } from '@app/services/v2/post-contract.service';
// import { Types, Config, DateChangeResult } from '@app/common/es-date-range/es-date-range.component';
// import { CommerceTableHeaderService } from '../commerce.table.service';
// import { map } from 'rxjs/operators';
import B from "./pages/b";

@Component({
    selector: 'app-report-commerce-industry',
    templateUrl: './industry.component.html',
    styleUrls: ['./industry.component.less'],
    providers: [CommerceTableHeaderService]
})
export class CommerceIndustryComponent {
    dataOrigin = [];
    dataList = {
        month: {
            title: '当月合同总额',
            sum: 0
        },
        quarter: {
            title: '当季合同总额',
            sum: 0
        },
        halfYear: {
            title: '半年合同总额',
            sum: 0
        },
        year: {
            title: '全年合同总额',
            sum: 0
        }
    };

    chartOption = {};
    capsuleChartData: Partial<Display.ChartCapsuleConfig>;

    headers = [];
    dataTableList = [];
    dataTableOrigin = [];
    options = {
        loading: true,
        editAction: false
    };
    dateRangeTypes: Types = {
        day: true,
        week: true,
        month: true,
        quarter: true,
        halfYear: true,
        year: true
    };

    noOrderTeam = [];
    dateRangeConfig: Config = {
        defaultType: 'year'
    };

    constructor(
        private postContractService: PostContractService,
        private postContractApiService: PostContractApiService,
        private commerceTableHeaderService: CommerceTableHeaderService
    ) { }

    ngOnInit() {
        this.headers = this.commerceTableHeaderService.getIndustryHeader();
    }

    queryAction(params: DateChangeResult) {
        this.options = this.postContractService.setLoading(true);
        this.postContractApiService.getIndustryData(params).pipe(
            map(rlt => {
                rlt['data']['tableDataOrigin'] = this.postContractService.deepCopy(rlt['data']['table_data']);
                rlt = this.postContractService.formatMoneyTableData(rlt['data'], 'table_data', this.commerceTableHeaderService.moneyProps);
                return rlt;
            })
        ).subscribe(res => {
            this.formatData(res);
        });
    }

    formatData(data) {
        const chartData = [];
        data['chart_data'].map(item => {
            if (item.industry_name) {
                if (item.order_amount) {
                    chartData.push({
                        name: item.industry_name,
                        value: this.postContractService.getContractNumber(item.order_amount)
                    });
                } else {
                    this.noOrderTeam.push(item.team_name);
                }
            }
        });
        this.setChart(chartData);
        this.setCapsule(chartData);

        if (data['table_data'].length) {
            this.dataTableList = this.postContractService.formatDataArrayDate(data['table_data']);
            this.dataTableOrigin = [...this.dataTableList];
        }

        this.dataList = this.postContractService.calcuKeyNumber(data['tableDataOrigin']);
        this.options = this.postContractService.setLoading(false);
    }

    setChart(data: Array<Display.ChartData>) {
        this.chartOption = this.postContractService.setPieChart(data, '行业分析');
    }

    setCapsule(data?: Array<Display.ChartData>) {
        const originData = data ? data : this.capsuleChartData.data;
        const config = this.postContractService.setCapsule(originData);
        this.capsuleChartData = config;
    }

    exportExcel() {
        this.postContractService.exportExcel(this.headers, this.dataTableList, this.options.loading, '行业分析');
    }

    onSearch(searchRlt) {
        this.dataTableList = searchRlt;
    }
}
