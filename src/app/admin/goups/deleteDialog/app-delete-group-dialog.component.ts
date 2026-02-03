import { Component, inject } from '@angular/core';
import { GroupService, Group } from '../group.service';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-group-dialog',
  imports: [],
  templateUrl: './app-delete-group-dialog.component.html',
  styleUrl: './app-delete-group-dialog.component.scss',
})
export class AppDeleteGroupDialog extends DialogBase<boolean> {
  readonly #data = inject<Group>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #groupService = inject(GroupService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#groupService.delete$(this.#data.groupId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
