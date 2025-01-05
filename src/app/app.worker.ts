/// <reference lib="webworker" />

import { AZ, Language, Letter, LetterType, Limits } from './types';

addEventListener('message', async ({ data }) => {
    if (data.mode === 'wordle') {
        await wordle(data);
    } else if (data.mode === 'search') {
        await search(data);
    }
});

async function search(data: any) {
    console.log(data);
    const str: string = data.str;
    const language: Language = data.lang;

    const answers = Object.values(
        (await (await fetch(`./assets/woorden/answers_${language}.json`)).json()) as Record<string, string[]>
    )
        .flatMap(x => x)
        .filter(word => word.includes(str));

    postMessage(answers);
}

async function wordle(data: any) {
    const words: (Letter | null)[][] = data.words;
    const wordLength: number = data.wordLength;
    const language: Language = data.lang;

    const limits: Limits = {
        correct: Array(wordLength).fill(null),
        incorrect: Array(wordLength).fill(null),
        exactAmount: Object.fromEntries(Object.values(AZ).map(x => [x, null])) as Record<AZ, number | null>,
        minAmount: Object.fromEntries(Object.values(AZ).map(x => [x, null])) as Record<AZ, number | null>,
    };

    try {
        words.forEach((word, wordI) =>
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

                    const curr = limits.exactAmount[letter.letter];
                    if (curr !== undefined && curr !== null && curr !== max) {
                        throw new Error(
                            `Woord ${wordI + 1}: '${
                                letter.letter
                            }' kan niet ${max} keer voor komen, want in een voorgaand woord kon hij maar ${curr} keer voorkomen.`
                        );
                    }
                    limits.incorrect[i] = [...new Set([...(limits.incorrect[i] ?? []), letter.letter].filter(x => x))];
                    limits.exactAmount[letter.letter] = max;
                }

                if (letter?.type === LetterType.correct || letter?.type === LetterType.somewhere) {
                    const min =
                        word.filter(
                            w =>
                                w?.letter === letter.letter &&
                                (w?.type === LetterType.correct || w?.type === LetterType.somewhere)
                        ).length ?? 0;
                    const curr = limits.minAmount[letter.letter];
                    if (curr === null || curr < min) {
                        limits.minAmount[letter.letter] = min;
                    }
                }
            })
        );
    } catch (e: any) {
        postMessage([]);
        return;
    }

    const answers = (await (await fetch(`./assets/woorden/answers_${language}.json`)).json()) as Record<string, string[]>;

    const result = answers[wordLength].filter(answer => {
        for (let i = 0; i < wordLength; i++) {
            if (limits.correct[i] !== null && answer[i] !== limits.correct[i]) {
                return false;
            }
            if (limits.incorrect[i] !== null && limits.incorrect[i]?.some(x => x === answer[i])) {
                return false;
            }
        }
        if (
            Object.entries(limits.exactAmount)
                .filter(([_, amount]) => amount !== null)
                .some(entry => {
                    const amount = entry[1];
                    if (amount === null) {
                        return false;
                    }
                    const occurances = answer.split(entry[0]).length - 1;
                    return amount !== occurances;
                }) ||
            Object.entries(limits.minAmount)
                .filter(([_, min]) => min !== null)
                .some(entry => {
                    const min = entry[1];
                    if (min === null) {
                        return false;
                    }
                    const occurances = answer.split(entry[0]).length - 1;
                    return min > occurances;
                })
        ) {
            return false;
        }
        return true;
    });

    postMessage(result);
}
