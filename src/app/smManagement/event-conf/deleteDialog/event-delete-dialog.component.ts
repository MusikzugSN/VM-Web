import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService, Event } from '@vm-utils/services';

@Component({
  selector: 'app-event-delete-dialog.component',
  imports: [],
  templateUrl: './event-delete-dialog.component.html',
  styleUrl: './event-delete-dialog.component.scss',
})
export class EventDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Event>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #eventService = inject(EventService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#eventService.delete$(this.#data.eventId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
