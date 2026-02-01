import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, shareReplay } from 'rxjs';
import { EventType, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class CurrentRouteService {
  readonly #router = inject(Router);

  // da der Router kein Observable für die URL änderungen bereitstellt, hier ein BehaviorSubject als workaround.
  #route$ = new BehaviorSubject(this.#router.url);

  route$ = this.#route$.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: false }));

  constructor() {
    this.#router.events
      .pipe(
        filter((event) => event.type === EventType.NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.#route$.next(this.#router.url));
  }
}
