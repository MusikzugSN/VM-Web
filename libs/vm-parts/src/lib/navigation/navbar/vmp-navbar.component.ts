import { Component, computed, inject, input, InputSignal, output, Signal } from '@angular/core';
import { VmcIconButton, VmcNavbar, VmNavbarItem } from '@vm-components';
import { filter, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ConfigService, CurrentRouteService } from '@vm-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoginConfigService, PermissionService, PermissionType } from '@vm-utils/services';

@Component({
  selector: 'vmp-navbar',
  imports: [AsyncPipe, VmcNavbar, VmcIconButton],
  templateUrl: './vmp-navbar.component.html',
  styleUrl: './vmp-navbar.component.scss',
})
export class VmpNavbar {
  readonly #currentRouteService = inject(CurrentRouteService);
  readonly #config = inject(ConfigService);
  readonly #loginConfigService = inject(LoginConfigService);
  readonly #permissionService = inject(PermissionService);

  loginConfig = toSignal(this.#loginConfigService.settings$);
  displayText = computed(() => {
    const settings = this.loginConfig();
    console.log('toolbar', settings);
    if (settings === undefined) {
      return '';
    }

    return settings.navigationBarText;
  });

  isLoggedIn: InputSignal<boolean> = input(false);
  logoutClicked = output<boolean>();

  iconLink$ = this.#config.config$.pipe(
    map((x) => x?.images.logo),
    filter((x) => x != null),
    map((x) => '/static' + x),
  );

  isMeAllowed = toSignal(
    this.#permissionService.hasPermissionFromMany$([PermissionType.OpenMyNotes]),
  );
  isScoreManagementAllowed = toSignal(
    this.#permissionService.hasPermissionFromMany$([
      PermissionType.OpenScores,
      PermissionType.OpenEvent,
      PermissionType.OpenMusicFolder,
      PermissionType.OpenValidateNotes,
      PermissionType.OpenVoice,
      PermissionType.OpenTags,
    ]),
  );
  isSysAdminAllowed = toSignal(
    this.#permissionService.hasPermissionFromMany$([
      PermissionType.OpenGroup,
      PermissionType.OpenRole,
      PermissionType.OpenUser,
      PermissionType.OpenLoginSettings,
    ]),
  );

  currentRoute = toSignal(this.#currentRouteService.route$);
  toolbarItems: Signal<VmNavbarItem[]> = computed(() => {
    const route = this.currentRoute();

    if (route === undefined) {
      return [];
    }

    const navbarItems: VmNavbarItem[] = [];

    if (this.isMeAllowed()) {
      navbarItems.push(this.#createToolbarItem('Mein Bereich', '/me', route));
    }

    if (this.isScoreManagementAllowed()) {
      navbarItems.push(this.#createToolbarItem('Notenverwaltung', '/scores', route));
    }

    if (this.isSysAdminAllowed()) {
      navbarItems.push(this.#createToolbarItem('Systemverwaltung', '/admin', route));
    }

    return navbarItems;
  });

  #createToolbarItem(name: string, route: string, currentRoute: string): VmNavbarItem {
    return {
      name: name,
      route: route,
      selected: currentRoute.startsWith(route),
    };
  }
}
