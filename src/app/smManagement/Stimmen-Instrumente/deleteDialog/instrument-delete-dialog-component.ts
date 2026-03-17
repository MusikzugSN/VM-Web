import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Instrument, InstrumentService } from '@vm-utils/services';

@Component({
  selector: 'app-instrument-delete-dialog',
  imports: [],
  templateUrl: './instrument-delete-dialog.component.html',
  styleUrl: './instrument-delete-dialoge-component.scss',
})
export class InstrumentDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Instrument>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #instrumentService = inject(InstrumentService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#instrumentService.delete$(this.#data.instrumentId));
        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
