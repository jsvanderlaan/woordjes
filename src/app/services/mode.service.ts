import { Injectable, signal } from '@angular/core';
import { Mode } from '../types';

@Injectable({ providedIn: 'root' })
export class ModeService {
    readonly current = signal<Mode>(Mode.wordle);
}
