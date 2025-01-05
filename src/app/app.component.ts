import { Component } from '@angular/core';
import { AnswersComponent } from './answers/answers.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { LanguageComponent } from './language/language.component';
import { ModeComponent } from './mode/mode.component';
import { SearchComponent } from './search/search.component';
import { ModeService } from './services/mode.service';
import { Mode } from './types';
import { WordleComponent } from './wordle/wordle.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [AnswersComponent, KeyboardComponent, WordleComponent, LanguageComponent, SearchComponent, ModeComponent],
    templateUrl: './app.component.html',
})
export class AppComponent {
    readonly modeType = Mode;
    constructor(public readonly mode: ModeService) {}
}
