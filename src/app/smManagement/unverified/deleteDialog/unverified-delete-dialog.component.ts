import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { Score, ScoreService } from '@vm-utils/services';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unverified-delete-dialog.component',
  imports: [],
  templateUrl: './unverified-delete-dialog.component.html',
  styleUrl: './unverified-delete-dialog.component.scss',
})
export class UnverifiedDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Score>(DIALOG_DATA);
  readonly #ScoreService = inject(ScoreService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  name = this.#data.title;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#ScoreService.delete$(this.#data.scoreId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
