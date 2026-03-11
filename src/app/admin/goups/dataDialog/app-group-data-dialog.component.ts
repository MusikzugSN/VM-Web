import { Component, inject } from '@angular/core';
import {
  convertToPatch,
  Dictionary,
  nameOf,
} from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmValidFormTypes } from '@vm-components';
import { VmFormField } from '@vm-components';
import { GroupService, Group } from '../group.service';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';

const groupNameKey = nameOf<Group>('name');

@Component({
  selector: 'app-edit-group-dialog',
  imports: [VmcInputField],
  templateUrl: './app-group-data-dialog.component.html',
  styleUrl: './app-group-data-dialog.component.scss',
})
export class AppGroupDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Group | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #groupService = inject(GroupService);

  formField: VmFormField = {
    type: 'text',
    key: 'name',
    label: 'Gruppenname',
    value: this.#data?.name ?? '',
  };

  changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Group, string>(this.changedValues);
      if (x === 'save') {
        patch.groupId = this.#data?.groupId ?? -1;
        await firstValueFrom(this.#groupService.change$(patch, patch.groupId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#groupService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.changedValues[key] = newValue as string;
  }

  protected readonly groupNameKey = groupNameKey;
}
