import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { Language } from '../types';

@Component({
    standalone: true,
    selector: 'language',
    templateUrl: './language.component.html',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageComponent {
    readonly languages = Object.values(Language);

    constructor(public readonly language: LanguageService) {}

    onLanguageChange(lang: Language): void {
        this.language.set(lang);
    }
}
