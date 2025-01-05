import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyboardService } from '../services/keyboard.service';
import { LanguageService } from '../services/language.service';
import { WorkerService } from '../services/worker.service';

@Component({
    standalone: true,
    selector: 'search',
    templateUrl: './search.component.html',
    imports: [],
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
    private readonly _sub = new Subscription();
    @ViewChild('search') searchElement!: ElementRef;

    constructor(
        private readonly _keyboard: KeyboardService,
        private readonly _worker: WorkerService,
        private readonly _lang: LanguageService
    ) {}

    ngOnInit(): void {
        this._sub.add(
            this._keyboard.alpha$.subscribe(x => {
                this.searchElement.nativeElement.value += x;
                this._search(this.searchElement.nativeElement.value);
            })
        );
        this._sub.add(
            this._keyboard.del$.subscribe(() => {
                const current = this.searchElement.nativeElement.value;
                if (current.length <= 0) {
                    return;
                }
                const next = current.substring(0, current.length - 1);
                this.searchElement.nativeElement.value = next;
                this._search(next);
            })
        );
        this._sub.add(
            this._lang.onLanguageChange.subscribe(() => {
                this.searchElement.nativeElement.value = '';
                this._search('');
            })
        );
        this._search('');
    }

    ngAfterViewInit(): void {
        this.searchElement.nativeElement.addEventListener('keypress', (e: InputEvent) => e.preventDefault());
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    private _search(str: string): void {
        this._worker.search(str);
    }
}
