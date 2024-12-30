import { Injectable, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Letter } from './types';

@Injectable({ providedIn: 'root' })
export class WorkerService {
    private readonly _next: Subject<{ words: (Letter | null)[][]; wordLength: number }> = new Subject();
    private _worker: Worker | null = null;

    readonly results: Subject<string[]> = new Subject();
    readonly loading = signal<boolean>(false);

    constructor() {
        this._next.pipe(debounceTime(200), distinctUntilChanged(deepEqual)).subscribe(next => {
            this.loading.set(true);
            if (this._worker !== null) {
                this._worker.terminate();
            }

            this._worker = new Worker(new URL('./app.worker', import.meta.url), { type: 'module' });
            this._worker.onmessage = ({ data }) => {
                this.loading.set(false);
                this.results.next(data);
            };
            this._worker.postMessage(next);
        });
    }

    next(words: (Letter | null)[][], wordLength: number): void {
        this._next.next({ words, wordLength });
    }
}

var deepEqual = function (x: any, y: any): boolean {
    if (x === y) {
        return true;
    } else if (typeof x == 'object' && x != null && typeof y == 'object' && y != null) {
        if (Object.keys(x).length != Object.keys(y).length) return false;

        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) return false;
            } else return false;
        }

        return true;
    } else return false;
};
