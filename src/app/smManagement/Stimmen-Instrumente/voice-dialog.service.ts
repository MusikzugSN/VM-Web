import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { InstrumentService } from '@vm-utils/services';
import { AppVoiceDataDialog, VoiceDialogData } from './dataDialog/app-voice-data-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #instrumentService = inject(InstrumentService);

  async openAddVoiceDialog(): Promise<boolean | undefined> {
    const instruments = await firstValueFrom(this.#instrumentService.load$());
    const instrumentOptions = instruments.map((i) => ({
      label: i.name,
      value: i.instrumentId.toString(),
    }));

    return this.#dialogService.open<boolean, VoiceDialogData>(AppVoiceDataDialog, {
      title: 'Stimme hinzufügen',
      data: {
        instrumentOptions,
      },
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '500px',
      },
    });
  }
}
