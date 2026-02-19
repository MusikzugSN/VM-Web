import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { Role, RoleService } from '../role.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-role-dialog',
  imports: [],
  templateUrl: './app-delete-role-dialog.component.html',
  styleUrl: './app-delete-role-dialog.component.scss',
})
export class AppDeleteRoleDialog extends DialogBase<boolean> {
  readonly #data = inject<Role>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #roleService = inject(RoleService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#roleService.delete$(this.#data.roleId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
