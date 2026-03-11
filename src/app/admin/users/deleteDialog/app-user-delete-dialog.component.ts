import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, UserService } from '../user.service';

interface UserDeleteDialogData extends User {
  asDisable: boolean;
}

@Component({
  selector: 'app-user-delete-dialog',
  imports: [],
  templateUrl: './app-user-delete-dialog.component.html',
  styleUrl: './app-user-delete-dialog.component.scss',
})
export class AppUserDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<UserDeleteDialogData>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #userService = inject(UserService);

  name = this.#data.username;
  asDisable = this.#data.asDisable;
  enabledText = this.#data.isEnabled ? 'deaktiviren' : 'reaktivieren';

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#userService.delete$(this.#data.userId));

        super.closeDialog(true);
      } else if (x === 'disable') {
        await firstValueFrom(
          this.#userService.change$(
            {
              userId: this.#data.userId,
              isEnabled: false,
            },
            this.#data.userId,
          ),
        );

        super.closeDialog(true);
      } else if (x === 'enable') {
        await firstValueFrom(
          this.#userService.change$(
            {
              userId: this.#data.userId,
              isEnabled: true,
            },
            this.#data.userId,
          ),
        );

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
