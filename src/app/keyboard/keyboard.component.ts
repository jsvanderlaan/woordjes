import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { KeyboardService } from '../services/keyboard.service';
import { Key } from '../types';

@Component({
    standalone: true,
    selector: 'keyboard',
    templateUrl: './keyboard.component.html',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardComponent implements OnDestroy {
    private readonly _onKeyPress = (event: KeyboardEvent) => this.onKeyPress(event);
    readonly key = Key;

    constructor(private readonly _keyboard: KeyboardService) {
        document.addEventListener('keydown', this._onKeyPress);
    }

    ngOnDestroy(): void {
        document.removeEventListener('keydown', this._onKeyPress);
    }

    onKeyPress(event: KeyboardEvent): void {
        const key = event.key.toUpperCase();

        if (key === 'BACKSPACE') {
            event.preventDefault();
            this.onKey(Key.del);
        } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
            event.preventDefault();
            this.onKey(key as Key);
        }
    }

    onKey(key: Key): void {
        this._keyboard.key(key);
    }
}
