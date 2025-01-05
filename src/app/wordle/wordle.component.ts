import { NgClass } from '@angular/common';
import { Component, computed, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyboardService } from '../services/keyboard.service';
import { LanguageService } from '../services/language.service';
import { WorkerService } from '../services/worker.service';
import { AZ, Language, Letter, LetterType } from '../types';
import { clamp } from '../utils';

@Component({
    standalone: true,
    selector: 'wordle',
    templateUrl: './wordle.component.html',
    imports: [NgClass],
})
export class WordleComponent implements OnInit, OnDestroy {
    @ViewChild('woordlengte', { static: false }) woordlengte!: ElementRef;

    private readonly _sub = new Subscription();
    readonly letterType = LetterType;

    readonly focus = signal<number>(0);
    readonly x = computed(() => clamp(Math.floor(this.focus() % this.wordLength()), 0, this.wordLength()));
    readonly y = computed(() => clamp(Math.floor(this.focus() / this.wordLength()), 0, this.attempts));

    readonly defaultWordLength = 5;
    readonly attempts = 6;
    readonly wordLength = signal<number>(this.defaultWordLength);

    private readonly numberRangeOptions: Record<Language, number[]> = {
        [Language.NL]: [
            2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
            33, 35, 36, 37, 41, 42, 43, 44, 46, 48,
        ],
        [Language.GB]: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 31,
        ],
    };

    readonly numberRange = computed(() => this.numberRangeOptions[this._lang.language()]);

    words: (Letter | null)[][] = Array(this.attempts)
        .fill(null)
        .map(() => Array(this.wordLength()).fill(null));

    constructor(
        private readonly _workerService: WorkerService,
        private readonly _lang: LanguageService,
        private readonly _keyboard: KeyboardService
    ) {}

    ngOnInit(): void {
        this._calc();
        this._sub.add(this._keyboard.alpha$.subscribe(key => this.key(key)));
        this._sub.add(this._keyboard.del$.subscribe(() => this.del()));
        this._sub.add(
            this._lang.onLanguageChange.subscribe(() => {
                this.woordlengte.nativeElement.value = this.defaultWordLength;
                this.wordLength.set(this.defaultWordLength);
                this.focus.set(0);
                this.words = Array(this.attempts)
                    .fill(null)
                    .map(() => Array(this.wordLength()).fill(null));
                this._calc();
            })
        );
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    key(str: AZ): void {
        const curr = this.words[this.y()][this.x()];
        if (curr !== null) {
            curr.letter = str;
        } else {
            this.words[this.y()][this.x()] = { letter: str, type: LetterType.nowhere };
        }
        this._setFocus(1);
        this._calc();
    }

    letter(wordIdx: number, letterIdx: number): void {
        this.focus.set(wordIdx * this.wordLength() + letterIdx);
        const current = this.words[wordIdx][letterIdx];
        if (current === null) {
        } else if (current.type === LetterType.nowhere) {
            current.type = LetterType.somewhere;
        } else if (current.type === LetterType.somewhere) {
            current.type = LetterType.correct;
        } else if (current.type === LetterType.correct) {
            current.type = LetterType.nowhere;
        }
        this._calc();
    }

    del(): void {
        this.words[this.y()][this.x()] = null;
        this._setFocus(-1);
        this._calc();
    }

    onNumberChange(num: number): void {
        this.wordLength.set(+num);
        this.focus.set(0);
        this.words = Array(this.attempts)
            .fill(null)
            .map(() => Array(this.wordLength()).fill(null));

        this._calc();
    }

    private _calc(): void {
        this._workerService.wordle(JSON.parse(JSON.stringify(this.words)), this.wordLength());
    }

    private _setFocus(delta: number): void {
        this.focus.set(clamp(this.focus() + delta, 0, this.wordLength() * this.attempts - 1));
    }
}
