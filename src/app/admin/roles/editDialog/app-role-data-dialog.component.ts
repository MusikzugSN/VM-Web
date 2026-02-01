import { Component, inject } from '@angular/core';
import {
  AsPipe,
  convertToPatch,
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
} from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { IColumn, VmcDataGrid, VmcInputField, VmFormField } from '@vm-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IPermission,
  IPermissionGroup,
  IPermissionValue,
  IRole,
  RolesService,
} from '../roles.service';
import { AsyncPipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

const roleNameKey = nameOf<IRole>('name');

@Component({
  selector: 'app-role-data-dialog',
  imports: [VmcInputField, AsyncPipe, VmcDataGrid, AsPipe, MatCheckbox, FormsModule],
  templateUrl: './app-role-data-dialog.component.html',
  styleUrl: './app-role-data-dialog.component.scss',
})
export class AppRoleDataDialog extends DialogBase<boolean> {
  readonly #data = inject<IRole | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #roleService = inject(RolesService);

  // @ts-expect-error
  ColumnType: IColumn<IRole>;
  // @ts-expect-error
  RowDataType: IPermissionValue[];
  // @ts-expect-error
  NumberType: number;

  permissions = this.#mapPermissionTypeToValue(this.#data?.permissions ?? []);

  structure$ = this.#roleService.getPermissionStructure$();
  columns: IColumn<IPermissionGroup>[] = [
    {
      key: 'groupDescription',
      header: 'Beschreibung',
      field: nameOf<IPermissionGroup>('name'),
      type: 'text',
    },
    {
      key: '0', //'permissionStart',
      header: 'Starten',
      field: nameOf<IPermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: '1', //'permissionRead',
      header: 'Lesen',
      field: nameOf<IPermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: '2', //'permissionCreate',
      header: 'Erstellen',
      field: nameOf<IPermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: '3', //'permissionEdit',
      header: 'Bearbeiten',
      field: nameOf<IPermissionGroup>('permissionValues'),
      type: 'template',
    },
    {
      key: '4', //'permissionDelete',
      header: 'Löschen',
      field: nameOf<IPermissionGroup>('permissionValues'),
      type: 'template',
    },
  ];

  nameField: VmFormField = {
    type: 'text',
    key: nameOf<IRole>('name'),
    label: 'Gruppenname',
    value: this.#data?.name ?? '',
  };

  changedValues: Dictionary<string | IPermission[]> = {};
  changedPermissions: Dictionary<boolean> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<IRole>(this.changedValues);
      if (x === 'save') {
        patch.roleId = this.#data?.roleId;
        await firstValueFrom(this.#roleService.changeRole$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#roleService.createRole$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: string | IPermission[], key: string): void {
    this.changedValues[key] = newValue;
  }

  storePermissionChange(permissionType: number, value: boolean): void {
    this.changedPermissions[permissionType.toString()] = value;
    this.storeChangedValue(this.#mapChangedPermissionsToArray(), nameOf<IRole>('permissions'));
  }

  #mapChangedPermissionsToArray(): IPermission[] {
    const permissions: IPermission[] = [];
    for (const key of Object.keys(this.changedPermissions)) {
      permissions.push({
        type: parseInt(key, 10),
        value: this.changedPermissions[key] ? 1 : 0,
      });
    }
    return permissions;
  }

  #mapPermissionTypeToValue(permissions: IPermission[]): Dictionary<boolean> {
    const map: Dictionary<boolean> = {};
    for (const permission of permissions) {
      map[permission.type.toString()] = permission.value > 0;
    }
    return map;
  }

  protected readonly nameOf = nameOf;
  protected readonly roleNameKey = roleNameKey;
}
