import {Component, inject, OnInit} from '@angular/core';
import {IToolbarItem, Toolbar} from '@vm-components';
import {Router} from '@angular/router';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'vmp-navbar',
  imports: [
    Toolbar,
    AsyncPipe
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar  {
  readonly #router = inject(Router);

  // da der Router kein Observable für die URL änderungen bereitstellt, hier ein BehaviorSubject als workaround.
  #route = new BehaviorSubject(this.#router.url);

  constructor() {
    this.#router.events
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.#route.next(this.#router.url)
    );
  }

  toolbarItems$: Observable<IToolbarItem[]> = this.#route.pipe(map(route => {
    return [
      this.#createToolbarItem('Mein Bereich', '/me', route),
      this.#createToolbarItem('Systemverwaltung', '/admin', route),
    ];
  }));

  #createToolbarItem(name: string, route: string, currentRoute: string): IToolbarItem {
    return {
      name: name,
      route: route,
      selected: currentRoute.startsWith(route)
    };
  }
}
