import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AsyncService {
    subjectObj = {};
    resizeDebounceTime = 200;
    setSubscriber(name) {
        if (this.subjectObj[name]) {
            console.warn('Duplicate subscriber: ' + name);
        } else {
            this.subjectObj[name] = new Subject();
        }
    }
}
