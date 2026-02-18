import {Component, inject} from '@angular/core';
import {
  AsPipe,
  convertToPatch,
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
  NumDictionary
} from '@vm-utils';
import {
  VmcDataGrid,
  VmCheckboxValues,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction, VmRowClickedEvent,
  VmValidFormTypes
} from '@vm-components';
import {BehaviorSubject, firstValueFrom, map, Observable} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {User, UserUpdate, UserService, UserGroupTeaser} from '../user.service';
import {AsyncPipe} from '@angular/common';
import {Group, GroupService} from '../../goups/group.service';
import {Role, RoleService} from '../../roles/role.service';

@Component({
  selector: 'app-user-data-dialog',
  imports: [
    VmcInputField,
    VmcDataGrid,
    AsyncPipe,
    AsPipe
  ],
  templateUrl: './app-user-data-dialog.component.html',
  styleUrl: './app-user-data-dialog.component.scss',
})
export class AppUserDataDialog extends DialogBase<boolean> {
  readonly #data = inject<User | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #userService = inject(UserService);
  readonly #groupService = inject(GroupService);
  readonly #roleService = inject(RoleService);

  #rolesById$: Observable<NumDictionary<Role>> = this.#roleService.load$()
    .pipe(map(x => x
      .reduce((acc, role) => ({...acc, [role.roleId]: role}),
        {} as NumDictionary<Role>)
      )
    );

  rolesById = toSignal<NumDictionary<Role>, NumDictionary<Role>> (this.#rolesById$, {
    initialValue: {},
  });

  #groupsById$: Observable<NumDictionary<Group>> = this.#groupService.load$()
    .pipe(map(x => x
        .reduce((acc, group) => ({...acc, [group.groupId]: group}),
          {} as NumDictionary<Group>)
      )
    );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>> (this.#groupsById$, {
    initialValue: {},
  });

  // @ts-expect-error
  NumberType: number;

  // Datasource für die UserGroupTeaser, damit Änderungen direkt in der Tabelle sichtbar sind
  userGroupData$: BehaviorSubject<UserGroupTeaser[]> = new BehaviorSubject<UserGroupTeaser[]>(this.#data?.userGroupTeasers ?? []);

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
  }

  // ToDo Florian: nur gennerieren
  passwordField: VmFormField = {
    label: 'Passwort',
    type: 'password',
    value: this.#data ? '********' : '',
    key: nameOf<UserUpdate>('password'),
    required: true,
  }

  isAdminField: VmFormField = {
    label: 'Administrator',
    type: 'checkbox',
    key: nameOf<UserUpdate>('isAdmin'),
    value: this.#data?.isAdmin ? 'checked' : 'unchecked',
  }

  isEnabledField: VmFormField = {
    label: 'Login erlaubt',
    type: 'checkbox',
    key: nameOf<UserUpdate>('isEnabled'),
    value: this.#data?.isEnabled ? 'checked' : 'unchecked',
  }

  userGroupColums: VmColumn<UserGroupTeaser>[] = [
    {
      key: 'groupId',
      header: 'Gruppen ID',
      field: nameOf<UserGroupTeaser>('groupId'),
      type: 'text',
    },
    {
      key: 'roleId',
      header: 'Rollen ID',
      field: nameOf<UserGroupTeaser>('roleId'),
      type: 'text',
    },
  ];

  userGroupActions: VmRowAction[] = [
    {
      key: 'delete',
      icon: 'delete',
    },
  ];


  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<User, VmValidFormTypes | boolean | UserGroupTeaser[]>(this.#changedValues);
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
    this.storeChangedValue(this.#changedGroupValues, nameOf<User>('userGroupTeasers'));
    this.userGroupData$.next(this.#changedGroupValues.filter(x => !x.deleted));
  }

  storeNewGroupValue(newValue: UserGroupTeaser): void {
    this.#changedGroupValues.push(newValue);
    this.#storeChangedGroupValues();
  }

  #storeDeletedGroupValue(deletedValue: UserGroupTeaser): void {
    if (this.#changedGroupValues.find(x => x.groupId === deletedValue.groupId && x.roleId === deletedValue.roleId)) {
      // Wenn die gelöschte Gruppe bereits in den Änderungen enthalten ist, muss sie entfernt werden, da sie sonst fälschlicherweise als neue Gruppe interpretiert werden könnte
      this.#changedGroupValues = this.#changedGroupValues.filter(x => !(x.groupId === deletedValue.groupId && x.roleId === deletedValue.roleId));
    } else {
      // Wenn die gelöschte Gruppe nicht in den Änderungen enthalten ist, muss sie mit dem "deleted"-Flag gespeichert werden, damit sie beim Speichern gelöscht wird
      deletedValue.deleted = true;
      this.#changedGroupValues.push(deletedValue);
    }
    this.#storeChangedGroupValues();
  }

  execActionFromRow(event: VmRowClickedEvent<UserGroupTeaser>) {
    if (event.key === 'delete') {
      this.#storeDeletedGroupValue(event.rowData);
    }
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === "checked";
  }
}
