import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Score, ScoreService } from '@vm-utils/services';

@Component({
  selector: 'app-score-delete-dialog',
  imports: [],
  templateUrl: './app-score-delete-dialog.component.html',
  styleUrl: './app-score-delete-dialog.component.scss',
})
export class AppScoreDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Score>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #scoreService = inject(ScoreService);

  name = this.#data.title;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#scoreService.delete$(this.#data.scoreId));

        super.closeDialog(true);
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
