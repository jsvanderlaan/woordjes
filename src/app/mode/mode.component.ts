import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModeService } from '../services/mode.service';
import { Mode } from '../types';

@Component({
    standalone: true,
    selector: 'mode',
    templateUrl: './mode.component.html',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeComponent {
    readonly modes = Object.values(Mode);

    constructor(public readonly mode: ModeService) {}

    onModeChange(mode: Mode): void {
        this.mode.current.set(mode);
    }
}
