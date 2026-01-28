import {Component, inject} from '@angular/core';
import {convertToPatch, DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase, Dictionary, nameOf} from '@vm-utils';
import {firstValueFrom, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {VmcInputField} from '@vm-components';
import {VmFormField} from '@vm-components';
import {GroupService, IGroup} from '../group.service';

const groupNameKey = nameOf<IGroup>('name');

@Component({
  selector: 'app-edit-group-dialog',
  imports: [
    VmcInputField
  ],
  templateUrl: './app-edit-group-dialog.component.html',
  styleUrl: './app-edit-group-dialog.component.scss',
})
export class AppEditGroupDialog extends DialogBase<boolean> {

  readonly #data = inject<IGroup>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #groupService = inject(GroupService);

  formField: VmFormField = {
    type: 'text',
    key: 'groupName',
    label: 'Gruppenname',
    value: this.#data.name
  };

  changedValues: Dictionary<string> = {}

  constructor() {
    super();
    this.#buttonClickEvents$
      .pipe(takeUntilDestroyed())
      .subscribe(async (x) => {
        if (x === 'save') {
          const patch = convertToPatch<IGroup>(this.changedValues);
          patch.groupId = this.#data.groupId;

          await firstValueFrom(this.#groupService.changeGroup$(patch));

          super.closeDialog(true);

        } else if (x === 'close') {
          super.closeDialog(false);
        }
      });
  }

  storeChangedValue(newValue: string, key: string) {
    this.changedValues[key] = newValue;
  }

  protected readonly nameOf = nameOf;
  protected readonly groupNameKey = groupNameKey;
}
