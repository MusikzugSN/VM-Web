import {Component, inject} from '@angular/core';
import {convertToPatch, DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase, Dictionary, nameOf} from '@vm-utils';
import {VmCheckboxValues, VmcInputField, VmFormField, VmValidFormTypes} from '@vm-components';
import {firstValueFrom, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {User, UserUpdate, UserService} from '../user.service';

@Component({
  selector: 'app-user-data-dialog',
  imports: [
    VmcInputField
  ],
  templateUrl: './app-user-data-dialog.component.html',
  styleUrl: './app-user-data-dialog.component.scss',
})
export class AppUserDataDialog extends DialogBase<boolean> {
  readonly #data = inject<User | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #userService = inject(UserService);

  #changedValues: Dictionary<VmValidFormTypes | VmCheckboxValues> = {};

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


  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const normalizedValues = this.normalizeValues(this.#changedValues);
      const patch = convertToPatch<User, VmValidFormTypes | boolean>(normalizedValues);
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

  storeChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.#changedValues[key] = newValue;
  }

  normalizeValues(
    dict: Dictionary<VmValidFormTypes | VmCheckboxValues>
  ): Dictionary<VmValidFormTypes | boolean> {
    const result: Dictionary<VmValidFormTypes | boolean> = {};

    for (const key in dict) {
      const value = dict[key];

      if (value === undefined) {
        continue;
      }

      if (
        value === "checked" ||
        value === "unchecked" ||
        value === "indeterminate"
      ) {
        result[key] = this.checkboxToBool(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  checkboxToBool(value: string): boolean {
    return value === "checked";
  }

}
