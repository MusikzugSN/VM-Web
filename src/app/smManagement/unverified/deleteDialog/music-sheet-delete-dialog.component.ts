import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MusicSheetService } from '@vm-utils/services';

export interface DeleteMusicSheetDialogData {
  musicSheetId: number;
  name: string;
}

@Component({
  selector: 'app-music-sheet-delete-dialog',
  imports: [],
  templateUrl: './music-sheet-delete-dialog.component.html',
  styleUrl: './music-sheet-delete-dialog.component.scss',
})
export class AppMusicSheetDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<DeleteMusicSheetDialogData>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #musicSheetService = inject(MusicSheetService);

  name = this.#data.name;

  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#musicSheetService.delete$(this.#data.musicSheetId));
        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}

