import { Component, inject } from '@angular/core';
import { AsPipe, convertToPatch, Dictionary, nameOf } from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import {
  VmColumn,
  VmcDataGrid,
  VmcInputField,
  VmValidFormTypes,
  VmFormField,
} from '@vm-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Permission,
  PermissionGroup,
  PermissionValue,
  Role,
  RoleService,
} from '@vm-utils/services';
import { AsyncPipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';

const roleNameKey = nameOf<Role>('name');

@Component({
  selector: 'app-role-data-dialog',
  imports: [VmcInputField, AsyncPipe, VmcDataGrid, AsPipe, MatCheckbox, FormsModule],
  templateUrl: './app-role-data-dialog.component.html',
  styleUrl: './app-role-data-dialog.component.scss',
})
export class AppRoleDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Role | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #roleService = inject(RoleService);

  // @ts-expect-error
  RowDataType: PermissionGroup;

  permissions = this.#mapPermissionTypeToValue(this.#data?.permissions ?? []);

  structure$ = this.#roleService.getPermissionStructure$();
  columns: VmColumn<PermissionGroup>[] = [
    {
      key: 'groupDescription',
      header: 'Beschreibung',
      field: nameOf<PermissionGroup>('name'),
      type: 'text',
    },
    {
      key: 'permissionStart',
      header: 'Starten',
      field: nameOf<PermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: 'permissionRead',
      header: 'Lesen',
      field: nameOf<PermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: 'permissionCreate',
      header: 'Erstellen',
      field: nameOf<PermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: 'permissionEdit',
      header: 'Bearbeiten',
      field: nameOf<PermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: 'permissionDelete',
      header: 'Löschen',
      field: nameOf<PermissionGroup>('permissionValues'),
      type: 'template',
    },
  ];

  nameField: VmFormField = {
    type: 'text',
    key: nameOf<Role>('name'),
    label: 'Gruppenname',
    value: this.#data?.name ?? '',
  };

  #changedValues: Dictionary<VmValidFormTypes | Permission[]> = {};
  #changedPermissions: Dictionary<boolean> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Role, VmValidFormTypes | Permission[]>(this.#changedValues);
      if (x === 'save') {
        patch.roleId = this.#data?.roleId ?? -1;
        await firstValueFrom(this.#roleService.change$(patch, patch.roleId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#roleService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes | Permission[], key: string): void {
    this.#changedValues[key] = newValue;
  }

  storePermissionChange(permissionType: number, value: boolean): void {
    this.#changedPermissions[permissionType.toString()] = value;
    this.storeChangedValue(this.#mapChangedPermissionsToArray(), nameOf<Role>('permissions'));
  }

  #mapChangedPermissionsToArray(): Permission[] {
    const permissions: Permission[] = [];
    for (const key of Object.keys(this.#changedPermissions)) {
      permissions.push({
        type: parseInt(key, 10),
        value: this.#changedPermissions[key] ? 1 : 0,
      });
    }
    return permissions;
  }

  #mapPermissionTypeToValue(permissions: Permission[]): Dictionary<boolean> {
    const map: Dictionary<boolean> = {};
    for (const permission of permissions) {
      map[permission.type.toString()] = permission.value > 0;
    }
    return map;
  }

  //todo far: Besser machen
  getPermissionValue(
    permissionValues: PermissionValue[],
    index: number,
  ): PermissionValue | undefined {
    return permissionValues.find((x) => x.permissionCategory === index);
  }

  protected readonly nameOf = nameOf;
  protected readonly roleNameKey = roleNameKey;
}
