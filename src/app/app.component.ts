import { NgClass } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ANSWERS } from './answers';
import { AZ, Letter, LetterType } from './types';
import { WorkerService } from './worker.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NgClass],
    templateUrl: './app.component.html',
    styles: [],
})
export class AppComponent {
    readonly defaultWordLength = 5;
    readonly error = signal<string | null>(null);
    readonly possible = signal<string[] | null>(null);
    readonly focus = signal<number>(0);
    readonly x = computed(() => clamp(Math.floor(this.focus() % this.wordLength()), 0, this.wordLength()));
    readonly y = computed(() => clamp(Math.floor(this.focus() / this.wordLength()), 0, this.attempts));
    readonly letterType = LetterType;
    readonly az = AZ;

    readonly loading = this._workerService.loading;

    readonly numberRange: number[] = Object.keys(ANSWERS).map(x => +x);

    readonly attempts = 6;
    readonly wordLength = signal<number>(this.defaultWordLength);
    words: (Letter | null)[][] = Array(this.attempts)
        .fill(null)
        .map(() => Array(this.wordLength()).fill(null));

    constructor(private readonly _workerService: WorkerService) {
        this.calc();
        document.addEventListener('keydown', event => this.onKeyPress(event));
        _workerService.results.subscribe(result => this.possible.set(result));
    }

    floor(num: number): number {
        return Math.floor(num);
    }

    key(str: AZ): void {
        const curr = this.words[this.y()][this.x()];
        if (curr !== null) {
            curr.letter = str;
        } else {
            this.words[this.y()][this.x()] = { letter: str, type: LetterType.nowhere };
        }
        this.setFocus(1);
        this.calc();
    }

    onKeyPress(event: KeyboardEvent): void {
        const key = event.key.toUpperCase();

        if (key === 'BACKSPACE') {
            event.preventDefault();
            this.del();
        } else if (key === ' ') {
            event.preventDefault();
            this.setFocus(1);
        } else if (key === 'ENTER') {
            event.preventDefault();
            this.setFocus(this.wordLength());
        } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
            event.preventDefault();
            this.key(key as AZ);
        }
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
        this.calc();
    }

    del(): void {
        this.words[this.y()][this.x()] = null;
        this.setFocus(-1);
        this.calc();
    }

    onNumberChange(num: number): void {
        this.wordLength.set(+num);
        this.focus.set(0);
        this.words = Array(this.attempts)
            .fill(null)
            .map(() => Array(this.wordLength()).fill(null));

        this.calc();
    }

    private calc(): void {
        this.error.set(null);
        this._workerService.next(JSON.parse(JSON.stringify(this.words)), this.wordLength());
    }

    private setFocus(delta: number): void {
        this.focus.set(clamp(this.focus() + delta, 0, this.wordLength() * this.attempts - 1));
    }
}

function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}
