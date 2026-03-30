import { Component, computed, inject } from '@angular/core';
import { VmSidebarGroup, VmSidebarItem } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { PermissionService, PermissionType } from '@vm-utils/services';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-admin-layout.component.html',
  styleUrl: './app-admin-layout.component.scss',
})
export class AppAdminLayout {
  readonly #permissionService = inject(PermissionService);

  readonly canOpenLoginSettings = toSignal(
    this.#permissionService.hasPermission$(PermissionType.OpenLoginSettings),
    { initialValue: false },
  );
  readonly canOpenGroups = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenGroup), {
    initialValue: false,
  });
  readonly canOpenRoles = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenRole), {
    initialValue: false,
  });
  readonly canOpenUsers = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenUser), {
    initialValue: false,
  });

  readonly sidebarItems = computed<VmSidebarGroup[]>(() => {
    const sidebarItems: VmSidebarGroup[] = [];

    const basicItems: VmSidebarItem[] = [];
    if (this.canOpenLoginSettings()) {
      basicItems.push({
        name: 'Logineinstellungen',
        route: '/admin/loginSettings',
      });
    }
    if (this.canOpenGroups()) {
      basicItems.push({
        name: 'Vereinsgruppen',
        route: '/admin/groups',
      });
    }
    if (basicItems.length > 0) {
      sidebarItems.push({
        groupName: 'Grundeinstellungen',
        items: basicItems,
      });
    }

    const userRoleItems: VmSidebarItem[] = [];
    if (this.canOpenRoles()) {
      userRoleItems.push({
        name: 'Rollen',
        route: '/admin/roles',
      });
    }
    if (this.canOpenUsers()) {
      userRoleItems.push({
        name: 'Benutzer',
        route: '/admin/users',
      });
    }
    if (userRoleItems.length > 0) {
      sidebarItems.push({
        groupName: 'Benutzer und Rollen',
        items: userRoleItems,
      });
    }

    return sidebarItems;
  });
}
