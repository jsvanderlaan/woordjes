import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NgClass],
    template: `
        <header class="mb-6">
            <h1 class="text-4xl font-bold text-gray-800">Wordle</h1>
        </header>

        <main class="mb-6">
            @for(word of []; track word){ jkdflfafs }
            <!-- <div class="grid grid-rows-6 gap-2">
                <div class="grid gap-2" ngClass="grid-cols-{{ wordLength }}">
                    @for(letter of [].constructor(wordLength); track letter; let idx = $index) {

                    <div
                        class="w-16 h-16 border-2 border-gray-400 flex items-center justify-center text-xl font-bold text-gray-800 bg-white"
                    >
                        {{ word[idx] }}
                    </div>
                    }
                </div>
            </div> -->
        </main>

        <!-- Keyboard -->
        <footer class="w-full max-w-md">
            <!-- Row 1 -->
            <div class="grid grid-cols-10 justify-center gap-1 mb-2">
                <button (click)="click('Q')" class="h-12 bg-gray-300 rounded text-lg font-bold">Q</button>
                <button (click)="click('W')" class="h-12 bg-gray-300 rounded text-lg font-bold">W</button>
                <button (click)="click('E')" class="h-12 bg-gray-300 rounded text-lg font-bold">E</button>
                <button (click)="click('R')" class="h-12 bg-gray-300 rounded text-lg font-bold">R</button>
                <button (click)="click('T')" class="h-12 bg-gray-300 rounded text-lg font-bold">T</button>
                <button (click)="click('Y')" class="h-12 bg-gray-300 rounded text-lg font-bold">Y</button>
                <button (click)="click('U')" class="h-12 bg-gray-300 rounded text-lg font-bold">U</button>
                <button (click)="click('I')" class="h-12 bg-gray-300 rounded text-lg font-bold">I</button>
                <button (click)="click('O')" class="h-12 bg-gray-300 rounded text-lg font-bold">O</button>
                <button (click)="click('P')" class="h-12 bg-gray-300 rounded text-lg font-bold">P</button>
                <!-- Row 2 -->
                <button (click)="click('A')" class=" h-12 bg-gray-300 rounded text-lg font-bold">A</button>
                <button (click)="click('S')" class=" h-12 bg-gray-300 rounded text-lg font-bold">S</button>
                <button (click)="click('D')" class=" h-12 bg-gray-300 rounded text-lg font-bold">D</button>
                <button (click)="click('F')" class=" h-12 bg-gray-300 rounded text-lg font-bold">F</button>
                <button (click)="click('G')" class=" h-12 bg-gray-300 rounded text-lg font-bold">G</button>
                <button (click)="click('H')" class=" h-12 bg-gray-300 rounded text-lg font-bold">H</button>
                <button (click)="click('J')" class=" h-12 bg-gray-300 rounded text-lg font-bold">J</button>
                <button (click)="click('K')" class=" h-12 bg-gray-300 rounded text-lg font-bold">K</button>
                <button (click)="click('L')" class=" h-12 bg-gray-300 rounded text-lg font-bold">L</button>
                <button (click)="del()" class=" h-12 bg-gray-300 rounded text-lg font-bold">
                    <img class="w-5 mx-auto" src="./assets/delete.png" />
                </button>
                <!-- Row 3 -->
                <div></div>
                <button (click)="click('Z')" class="h-12 bg-gray-300 rounded text-lg font-bold">Z</button>
                <button (click)="click('X')" class="h-12 bg-gray-300 rounded text-lg font-bold">X</button>
                <button (click)="click('C')" class="h-12 bg-gray-300 rounded text-lg font-bold">C</button>
                <button (click)="click('V')" class="h-12 bg-gray-300 rounded text-lg font-bold">V</button>
                <button (click)="click('B')" class="h-12 bg-gray-300 rounded text-lg font-bold">B</button>
                <button (click)="click('N')" class="h-12 bg-gray-300 rounded text-lg font-bold">N</button>
                <button (click)="click('M')" class="h-12 bg-gray-300 rounded text-lg font-bold">M</button>

                <button (click)="enter()" class="grid-cols-subgrid col-span-2 h-12 bg-gray-300 rounded text-lg font-bold">
                    ENTER
                </button>
            </div>
        </footer>
    `,
    styles: [],
})
export class AppComponent {
    readonly wordLength = 5;
    readonly words: string[] = ['', '', '', '', '', ''];

    click(str: string): void {}

    enter(): void {}

    del(): void {}
}
