import { Component, inject, input, InputSignal, output } from '@angular/core';
import { VmNavbarItem, VmcIconButton, VmcNavbar } from '@vm-components';
import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrentRouteService } from '@vm-utils';

@Component({
  selector: 'vmp-navbar',
  imports: [AsyncPipe, VmcNavbar, VmcIconButton],
  templateUrl: './vmp-navbar.component.html',
  styleUrl: './vmp-navbar.component.scss',
})
export class VmpNavbar {
  readonly #currentRouteService = inject(CurrentRouteService);

  isLoggedIn: InputSignal<boolean> = input(false);
  logoutClicked = output<boolean>();

  toolbarItems$: Observable<VmNavbarItem[]> = this.#currentRouteService.route$.pipe(
    map((route) => {
      return [
        this.#createToolbarItem('Mein Bereich', '/me', route),
        this.#createToolbarItem('Notenverwaltung', '/scores', route),
        this.#createToolbarItem('Systemverwaltung', '/admin', route),
      ];
    }),
  );

  #createToolbarItem(name: string, route: string, currentRoute: string): VmNavbarItem {
    return {
      name: name,
      route: route,
      selected: currentRoute.startsWith(route),
    };
  }
}
