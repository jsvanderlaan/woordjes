import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LanguageService } from '../services/language.service';
import { WorkerService } from '../services/worker.service';

@Component({
    standalone: true,
    selector: 'search',
    templateUrl: './search.component.html',
    imports: [FormsModule],
})
export class SearchComponent implements OnInit, OnDestroy {
    private readonly _sub = new Subscription();
    @ViewChild('search') searchElement!: ElementRef;

    searchText = '';
    isExactMode = false;

    constructor(
        private readonly _worker: WorkerService,
        private readonly _lang: LanguageService
    ) {}

    ngOnInit(): void {
        this._sub.add(this._lang.onLanguageChange.subscribe(() => this.onSearch()));
        this.onSearch();
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    onSearch(): void {
        this._worker.search(this.searchText, !this.isExactMode);
    }
}
