import { Component, inject } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  VmCheckboxValues,
  VmcInputField,
  VmcSelect,
  VmcToolbar, VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes
} from '@vm-components';
import {GroupService, LoginConfigDto, LoginConfigService, RoleService} from '@vm-utils/services';
import {SnackbarService} from '@vm-utils/snackbar';

@Component({
  selector: 'app-config-login',
  imports: [VmcInputField, VmcSelect, VmcToolbar, AsyncPipe],
  templateUrl: './app-loginSettings.component.html',
  styleUrl: './app-loginSettings.component.scss',
})
export class AppConfigLogin {
  readonly #service = inject(LoginConfigService);
  readonly #snackbarService = inject(SnackbarService);
  readonly #groupService = inject(GroupService);
  readonly #roleService = inject(RoleService);

  #changedValues: Partial<LoginConfigDto> = {};

  config$: Observable<LoginConfigDto> = this.#service.settings$;

  groups$ = this.#groupService.load$().pipe(map(groups => {
    return groups.map(group => {
      return {
        label: group.name,
        value: group.groupId.toString()
      } as VmSelectOption
    });
  }));

  roles$ = this.#roleService.load$().pipe(map(groups => {
    return groups.map(group => {
      return {
        label: group.name,
        value: group.roleId.toString()
      } as VmSelectOption
    });
  }));

  items: VmToolbarItem[] = [
    {
      key: 'save',
      icon: 'save',
      label: 'Speichern',
      action: async () => {
        await firstValueFrom(this.#service.save$(this.#changedValues));
        this.#service.reloadSettings();
        this.#snackbarService.raiseSuccess('Änderungen gespeichert!');
      },
    },
  ];


  updateValue(key: keyof LoginConfigDto, value: VmValidFormTypes): void {
    this.#changedValues = { ...this.#changedValues, [key]: value };
  }

  updateBoolValue(key: keyof LoginConfigDto, value: VmValidFormTypes | VmCheckboxValues): void {
    this.#changedValues = { ...this.#changedValues, [key]: value === "checked" };
  }
}
