import { Component, inject } from '@angular/core';
import {
  AsPipe,
  ConfigService,
  convertToPatch,
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
  NumDictionary, SnackbarService,
} from '@vm-utils';
import {
  VmcDataGrid,
  VmCheckboxValues,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, map, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { User, UserUpdate, UserService, UserGroupTeaser } from '../user.service';
import { AsyncPipe } from '@angular/common';
import { Group, GroupService } from '../../goups/group.service';
import { Role, RoleService } from '../../roles/role.service';

const noProviderOption: VmSelectOption = {
  label: 'Kein Anbieter',
  value: '',
};

@Component({
  selector: 'app-user-data-dialog',
  imports: [VmcInputField, VmcDataGrid, AsyncPipe, AsPipe],
  templateUrl: './app-user-data-dialog.component.html',
  styleUrl: './app-user-data-dialog.component.scss',
})
export class AppUserDataDialog extends DialogBase<boolean> {
  readonly #data = inject<User | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #userService = inject(UserService);
  readonly #groupService = inject(GroupService);
  readonly #roleService = inject(RoleService);
  readonly #config = inject(ConfigService);
  readonly #snackbarService = inject(SnackbarService);

  #roles$: Observable<Role[]> = this.#roleService.load$();

  #roleOptions$: Observable<VmSelectOption[]> = this.#roles$.pipe(
    map((x) => x.map((group) => ({ label: group.name, value: group.roleId.toString() }))),
  );

  roleOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#roleOptions$, {
    initialValue: [],
  });

  #rolesById$: Observable<NumDictionary<Role>> = this.#roles$.pipe(
    map((x) =>
      x.reduce((acc, role) => ({ ...acc, [role.roleId]: role }), {} as NumDictionary<Role>),
    ),
  );

  rolesById = toSignal<NumDictionary<Role>, NumDictionary<Role>>(this.#rolesById$, {
    initialValue: {},
  });

  #groups$: Observable<Group[]> = this.#groupService.load$();

  #groupOptions$: Observable<VmSelectOption[]> = this.#groups$.pipe(
    map((x) => x.map((group) => ({ label: group.name, value: group.groupId.toString() }))),
  );

  groupOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#groupOptions$, {
    initialValue: [],
  });

  #groupsById$: Observable<NumDictionary<Group>> = this.#groups$.pipe(
    map((x) =>
      x.reduce((acc, group) => ({ ...acc, [group.groupId]: group }), {} as NumDictionary<Group>),
    ),
  );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>>(this.#groupsById$, {
    initialValue: {},
  });

  // @ts-expect-error
  RoleType: Role;
  // @ts-expect-error
  GroupType: Group;

  // Datasource für die UserGroupTeaser, damit Änderungen direkt in der Tabelle sichtbar sind
  userGroupData$: BehaviorSubject<UserGroupTeaser[]> = new BehaviorSubject<UserGroupTeaser[]>(
    this.#data?.roles ?? [],
  );

  // Hier werden alle geänderten Werte zwischengespeichert, damit sie beim Speichern in einem Patch-Objekt zusammengefasst werden können
  #changedValues: Dictionary<VmValidFormTypes | boolean | UserGroupTeaser[]> = {};
  #changedGroupValues: UserGroupTeaser[] = [];

  nameField: VmFormField = {
    label: 'Benutzername',
    type: 'text',
    key: nameOf<UserUpdate>('username'),
    required: true,
    value: this.#data?.username,
    placeholder: 'z. B. max.mustermann',
  };

  // ToDo Florian: nur gennerieren
  passwordField: VmFormField = {
    label: 'Passwort',
    type: 'password',
    value: this.#data?.isPasswordSet ? '********' : '',
    key: nameOf<UserUpdate>('password'),
  };

  isAdminField: VmFormField = {
    label: 'Administrator',
    type: 'checkbox',
    key: nameOf<UserUpdate>('isAdmin'),
    value: this.#data?.isAdmin ? 'checked' : 'unchecked',
    labelPosition: 'before',
  };

  isEnabledField: VmFormField = {
    label: 'Login erlaubt',
    type: 'checkbox',
    key: nameOf<UserUpdate>('isEnabled'),
    value: this.#data?.isEnabled ? 'checked' : 'unchecked',
    labelPosition: 'before',
  };

  providerSelectorFieldPlaceholder: VmFormField = {
    key: nameOf<UserUpdate>('provider'),
    label: 'Anbieter',
    type: 'select',
    options: [noProviderOption],
  };

  providerSelectorField$: Observable<VmFormField> = this.#config.oauthProviders$.pipe(
    distinctUntilChanged(),
    map((providers) => {
      return {
        label: 'OAuth Anbieter',
        type: 'select',
        key: nameOf<UserUpdate>('provider'),
        value: this.#data?.provider ?? '',
        options: [
          noProviderOption,
          ...providers.map((x) => ({ label: x.displayName, value: x.providerKey })),
        ],
      } as VmFormField;
    }),
    takeUntilDestroyed(),
  );

  oAuthSubjectField: VmFormField = {
    label: 'OAuth Kennung',
    type: 'text',
    key: nameOf<UserUpdate>('oAuthSubject'),
    value: this.#data?.oAuthSubject,
    placeholder: 'z. B. 1234-xyz-5678',
  };

  userGroupColumns: VmColumn<UserGroupTeaser>[] = [
    {
      key: 'groupId',
      header: 'Gruppe',
      field: nameOf<UserGroupTeaser>('groupId'),
      type: 'template',
      footerAsTemplate: true,
    },
    {
      key: 'roleId',
      header: 'Rolle',
      field: nameOf<UserGroupTeaser>('roleId'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  userGroupActions: VmRowAction[] = [
    {
      key: 'delete',
      icon: 'delete',
    },
  ];

  footerActions: VmRowAction[] = [
    {
      key: 'add',
      icon: 'add',
    },
  ];

  #newUserGroup: UserGroupTeaser = {
    groupId: -1,
    roleId: -1,
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<User, VmValidFormTypes | boolean | UserGroupTeaser[]>(
        this.#changedValues,
      );
      if (x === 'save') {
        patch.userId = this.#data?.userId ?? -1;
        await firstValueFrom(this.#userService.change$(patch, patch.userId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#userService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes | boolean | UserGroupTeaser[], key: string): void {
    this.#changedValues[key] = newValue;
  }

  storeBooleanChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.storeChangedValue(this.#checkboxToBool(newValue), key);
  }

  #storeChangedGroupValues(): void {
    this.storeChangedValue(this.#changedGroupValues, nameOf<User>('roles'));

    const oldData = this.#data?.roles ?? [];
    let newData = [...oldData];
    for (const changedGroupValue of this.#changedGroupValues) {
      if (changedGroupValue.deleted) {
        newData = newData.filter(
          (x) =>
            !(x.groupId === changedGroupValue.groupId && x.roleId === changedGroupValue.roleId),
        );
      } else {
        newData.push(changedGroupValue);
      }
    }

    this.userGroupData$.next(newData);
  }

  #storeNewGroupValue(newValue: UserGroupTeaser): void {
    // der Eintrag existiert bereits in den aktuellen Werten, also muss er nicht erneut hinzugefügt werden
    const currentValues = this.userGroupData$.getValue();
    if (currentValues.find((x) => x.groupId === newValue.groupId && x.roleId === newValue.roleId)) {
      this.#snackbarService.raiseError("Die Gruppe mit der Rolle ist bereits vorhanden.", 2500);
      return;
    }

    // Der Eintrag wurde gelöscht und muss nun wieder hinzugefügt werden, also muss er aus den gelöschten Werten entfernt werden
    if (
      this.#changedGroupValues.find(
        (x) => x.groupId === newValue.groupId && x.roleId === newValue.roleId && x.deleted,
      )
    ) {
      this.#changedGroupValues = this.#changedGroupValues.filter(
        (x) => !(x.groupId === newValue.groupId && x.roleId === newValue.roleId && x.deleted),
      );
    } else {
      this.#changedGroupValues.push({
        groupId: newValue.groupId,
        roleId: newValue.roleId,
      });
    }

    this.#storeChangedGroupValues();
  }

  #storeDeletedGroupValue(deletedValue: UserGroupTeaser): void {
    if (
      this.#changedGroupValues.find(
        (x) => x.groupId === deletedValue.groupId && x.roleId === deletedValue.roleId,
      )
    ) {
      // Wenn die gelöschte Gruppe bereits in den Änderungen enthalten ist, muss sie entfernt werden, da sie sonst fälschlicherweise als neue Gruppe interpretiert werden könnte
      this.#changedGroupValues = this.#changedGroupValues.filter(
        (x) => !(x.groupId === deletedValue.groupId && x.roleId === deletedValue.roleId),
      );
    } else {
      // Wenn die gelöschte Gruppe nicht in den Änderungen enthalten ist, muss sie mit dem "deleted"-Flag gespeichert werden, damit sie beim Speichern gelöscht wird
      deletedValue.deleted = true;
      this.#changedGroupValues.push(deletedValue);
    }
    this.#storeChangedGroupValues();
  }

  storeNewGroupChange(value: VmValidFormTypes): void {
    this.#newUserGroup.groupId = parseInt(value as string);
  }

  storeNewRoleChange(value: VmValidFormTypes): void {
    this.#newUserGroup.roleId = parseInt(value as string);
  }

  execActionFromRow(event: VmRowClickedEvent<UserGroupTeaser>): void {
    if (event.key === 'delete') {
      if (event.rowData === null) {
        return;
      }
      this.#storeDeletedGroupValue(event.rowData);
    } else if (event.key === 'add') {
      if (this.#newUserGroup.groupId !== -1 && this.#newUserGroup.roleId !== -1) {
        this.#storeNewGroupValue(this.#newUserGroup);
      } // todo far: handle error
    }
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }
}
