import { Component, inject } from '@angular/core';
import {
  convertToPatch,
  Dictionary,
  nameOf,
} from '@vm-utils';
import {
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
} from '@vm-utils/dialogs';
import { VmcInputField, VmFormField, VmValidFormTypes } from '@vm-components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { firstValueFrom, Observable } from 'rxjs';
import { Tag, TagsService } from '@vm-utils/services';

@Component({
  selector: 'app-tags-data-dialog.component',
  imports: [VmcInputField],
  templateUrl: './tags-data-dialog.component.html',
  styleUrl: './tags-data-dialog.component.scss',
})
export class TagsDataDialog extends DialogBase<boolean> {
  readonly #data = inject< Tag | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #tagService = inject( TagsService );

  tagNameField: VmFormField = {
    type: 'text',
    key: nameOf<Tag>('name'),
    label: 'Tagname',
    required: true,
    value: this.#data?.name ?? '',
    placeholder: 'Favourite',
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Tag, string>(this.changedValues);
      if (x === 'save') {
        patch.tagId = this.#data?.tagId ?? -1;
        await firstValueFrom(this.#tagService.change$(patch, patch.tagId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#tagService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
  changedValues: Dictionary<string> = {};

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.changedValues[key] = newValue as string;
  }
}
