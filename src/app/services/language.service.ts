import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subject } from 'rxjs';
import { Language } from '../types';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    static readonly defaultLang = Language.NL;
    private readonly _lang = new Subject<Language>();
    readonly language = toSignal(this._lang, { initialValue: LanguageService.defaultLang });
    readonly onLanguageChange = this._lang.pipe(map(() => null));

    set(lang: Language): void {
        this._lang.next(lang);
    }
}
