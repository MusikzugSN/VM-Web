import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Voice, VoiceService } from '@vm-utils/services';

@Component({
  selector: 'app-voice-delete-dialog',
  imports: [],
  templateUrl: './voice-delete-dialog.component.html',
  styleUrl: './voice-delete-dialog.component.scss',
})
export class VoiceDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Voice>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #voiceService = inject(VoiceService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#voiceService.delete$(this.#data.voiceId));
        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
