import { Injectable } from '@angular/core';
import { combineLatest, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Letter } from '../types';
import { AnswersService } from './answers.service';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class WorkerService {
    private readonly _wordle: Subject<{ words: (Letter | null)[][]; wordLength: number }> = new Subject();
    private readonly _search: Subject<{ str: string; contains: boolean }> = new Subject();
    private _worker: Worker | null = null;

    constructor(
        private readonly _answers: AnswersService,
        private readonly _language: LanguageService
    ) {
        combineLatest([
            this._wordle.pipe(debounceTime(200), distinctUntilChanged(deepEqual)),
            this._language.language$,
        ]).subscribe(([next, lang]) => this._process({ ...next, mode: 'wordle', lang }));
        combineLatest([
            this._search.pipe(debounceTime(200), distinctUntilChanged(deepEqual)),
            this._language.language$,
        ]).subscribe(([next, lang]) => this._process({ ...next, mode: 'search', lang }));
    }

    wordle(words: (Letter | null)[][], wordLength: number): void {
        this._wordle.next({ words, wordLength });
    }

    search(str: string, contains: boolean): void {
        this._search.next({ str, contains });
    }

    private _process(d: any): void {
        this._answers.loading.set(true);
        if (this._worker !== null) {
            this._worker.terminate();
        }

        this._worker = new Worker(new URL('../app.worker', import.meta.url), { type: 'module' });
        this._worker.onmessage = ({ data }) => {
            this._answers.loading.set(false);
            this._answers.list.set(data);
        };
        this._worker.postMessage(d);
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
