import { NgClass } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ANSWERS_5 } from './answers';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NgClass],
    templateUrl: './app.component.html',
    styles: [],
})
export class AppComponent {
    readonly error = signal<string | null>(null);
    readonly possible = signal<string[] | null>(null);
    readonly focus = signal<number>(0);
    readonly x = computed(() => clamp(Math.floor(this.focus() % this.wordLength()), 0, this.wordLength()));
    readonly y = computed(() => clamp(Math.floor(this.focus() / this.wordLength()), 0, this.attempts));
    readonly letterType = LetterType;
    readonly az = AZ;

    readonly attempts = 6;
    readonly wordLength = signal<number>(5);
    readonly words: (Letter | null)[][] = Array(this.attempts)
        .fill(null)
        .map(() => Array(this.wordLength()).fill(null));

    constructor() {
        this.calc();
        document.addEventListener('keydown', event => this.onKeyPress(event));
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
        event.preventDefault();

        if (key === 'BACKSPACE') {
            this.del();
        } else if (key === ' ') {
            this.setFocus(1);
        } else if (key === 'ENTER') {
            this.setFocus(this.wordLength());
        } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
            this.key(key as AZ);
        }
    }

    // enter(): void {}

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

    private calc(): void {
        this.error.set(null);
        const limits: {
            correct: (string | null)[];
            incorrect: (string[] | null)[];
            maxAmount: Record<AZ, number | null>;
        } = {
            correct: Array(this.wordLength()).fill(null),
            incorrect: Array(this.wordLength()).fill(null),
            maxAmount: Object.fromEntries(Object.values(AZ).map(x => [x, null])) as Record<AZ, number | null>,
        };

        try {
            this.words
                .filter(word => word.filter(letter => letter !== null).length === 5)
                .forEach((word, wordI) =>
                    word.forEach((letter, i) => {
                        if (letter?.type === LetterType.correct) {
                            if (limits.correct[i] !== null && limits.correct[i] !== letter.letter) {
                                throw new Error(
                                    `Woord ${wordI + 1}: '${letter.letter}' kan niet groen zijn als ${i + 1}e letter, want ${
                                        limits.correct[i]
                                    } is al groen in die positie.`
                                );
                            }

                            if (limits.incorrect[i] !== null && limits.incorrect[i]?.some(x => x === letter.letter)) {
                                throw new Error(
                                    `Woord ${wordI + 1}: '${letter.letter}' kan niet groen zijn als ${i + 1}e letter, want hij is al oranje in een ander woord.`
                                );
                            }

                            limits.correct[i] = letter.letter;
                        } else if (letter?.type === LetterType.somewhere) {
                            if (limits.correct[i] === letter.letter) {
                                throw new Error(
                                    `Woord ${wordI + 1}: '${letter.letter}' kan niet orangje zijn als ${i + 1}e letter, want hij is al groen in een ander woord.`
                                );
                            }
                            limits.incorrect[i] = [...new Set([...(limits.incorrect[i] ?? []), letter.letter].filter(x => x))];
                        } else if (letter?.type === LetterType.nowhere) {
                            let max = 0;
                            max +=
                                word.filter(
                                    w =>
                                        w?.letter === letter.letter &&
                                        (w?.type === LetterType.correct || w?.type === LetterType.somewhere)
                                ).length ?? 0;

                            const curr = limits.maxAmount[letter.letter];
                            if (curr !== undefined && curr !== null && curr !== max) {
                                throw new Error(
                                    `Woord ${wordI + 1}: '${
                                        letter.letter
                                    }' kan niet ${max} keer voor komen, want in een voorgaand woord kon hij maar ${curr} keer voorkomen.`
                                );
                            }
                            limits.maxAmount[letter.letter] = max;
                        }
                    })
                );
        } catch (e: any) {
            this.error.set(e?.message);
            this.possible.set(null);
            return;
        }

        this.possible.set(
            ANSWERS_5.filter(answer => {
                // todo answers_6
                for (let i = 0; i < this.wordLength(); i++) {
                    if (limits.correct[i] !== null && answer[i] !== limits.correct[i]) {
                        return false;
                    }
                    if (limits.incorrect[i] !== null && limits.incorrect[i]?.some(x => x === answer[i])) {
                        return false;
                    }
                }
                if (
                    Object.entries(limits.maxAmount)
                        .filter(([_, amount]) => amount !== null)
                        .some(entry => {
                            const max = entry[1];
                            if (max === null) {
                                return false;
                            }
                            const occurances = answer.split(entry[0]).length - 1;
                            return max < occurances;
                        })
                ) {
                    return false;
                }
                return true;
            })
        );
    }

    private setFocus(delta: number): void {
        this.focus.set(clamp(this.focus() + delta, 0, this.wordLength() * this.attempts - 1));
    }
}

export enum LetterType {
    nowhere,
    somewhere,
    correct,
}

export type Letter = { letter: AZ; type: LetterType };

export enum AZ {
    a = 'A',
    b = 'B',
    c = 'C',
    d = 'D',
    e = 'E',
    f = 'F',
    g = 'G',
    h = 'H',
    i = 'I',
    j = 'J',
    k = 'K',
    l = 'L',
    m = 'M',
    n = 'N',
    o = 'O',
    p = 'P',
    q = 'Q',
    r = 'R',
    s = 'S',
    t = 'T',
    u = 'U',
    v = 'V',
    w = 'W',
    x = 'X',
    y = 'Y',
    z = 'Z',
}

function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}
