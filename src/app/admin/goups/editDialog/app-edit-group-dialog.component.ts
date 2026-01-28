import {Component, inject, Inject} from '@angular/core';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase, Dictionary, nameOf} from '@vm-utils';
import {firstValueFrom, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {VmcInputField} from '@vm-components';
import {VmFormField} from '../../../../../libs/vm-components/src/lib/input/form.models';
import {IGroup} from '../group.service';
import {HttpClient} from '@angular/common/http';

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
  readonly #httpClient = inject(HttpClient);

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
          const patch = this.toGroupPatch(this.changedValues);
          patch.groupId = this.#data.groupId;

          const response = await firstValueFrom(this.#httpClient.patch('group', patch))

          console.log(response);
          super.closeDialog(true);

        } else if (x === 'close') {
          super.closeDialog(false);
        }
      });
  }

  storeChangedValue(newValue: string, key: string) {
    this.changedValues[key] = newValue;
  }

  toGroupPatch(dict: Dictionary<string>): Partial<IGroup> {
    return Object.fromEntries(
      Object.entries(dict).filter(([_, v]) => v !== undefined)
    ) as Partial<IGroup>;
  }


  protected readonly nameOf = nameOf;
  protected readonly groupNameKey = groupNameKey;
}
