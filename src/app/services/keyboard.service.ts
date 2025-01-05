import { Injectable } from '@angular/core';
import { filter, map, Subject } from 'rxjs';
import { AZ, Key } from '../types';

@Injectable({ providedIn: 'root' })
export class KeyboardService {
    private readonly _key$ = new Subject<Key>();

    readonly key$ = this._key$.asObservable();
    readonly enter$ = this._key$.asObservable().pipe(filter(key => key === Key.enter));
    readonly del$ = this._key$.asObservable().pipe(filter(key => key === Key.del));
    readonly alpha$ = this._key$.asObservable().pipe(
        filter(
            key =>
                key === Key.a ||
                key === Key.b ||
                key === Key.c ||
                key === Key.d ||
                key === Key.e ||
                key === Key.f ||
                key === Key.g ||
                key === Key.h ||
                key === Key.i ||
                key === Key.j ||
                key === Key.k ||
                key === Key.l ||
                key === Key.m ||
                key === Key.n ||
                key === Key.o ||
                key === Key.p ||
                key === Key.q ||
                key === Key.r ||
                key === Key.s ||
                key === Key.t ||
                key === Key.u ||
                key === Key.v ||
                key === Key.w ||
                key === Key.x ||
                key === Key.y ||
                key === Key.z
        ),
        map(key => key as unknown as AZ)
    );

    key(key: Key): void {
        this._key$.next(key);
    }
}
