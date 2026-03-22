import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { InstrumentService, Voice, VoiceService } from '@vm-utils/services';
import { AppVoiceDataDialog, VoiceDialogData } from './dataDialog/app-voice-data-dialog.component';
import { VoiceDeleteDialog } from './deleteDialog/voice-delete-dialog-component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #instrumentService = inject(InstrumentService);
  readonly #voiceService = inject(VoiceService);

  async openAddVoiceDialog(): Promise<boolean | undefined> {
    const [instruments, voices] = await Promise.all([
      firstValueFrom(this.#instrumentService.load$()),
      firstValueFrom(
        this.#voiceService.load$({ includeInstrumentName: true, includeAlternateVoices: true }),
      ),
    ]);

    const instrumentOptions = instruments.map((i) => ({
      label: i.name,
      value: i.instrumentId.toString(),
    }));

    const alternativeVoiceOptions = voices.map((v) => ({
      label: `${v.instrumentName ?? ''} ${v.name}`.trim(),
      value: v.voiceId.toString(),
    }));

    return this.#dialogService.open<boolean, VoiceDialogData>(AppVoiceDataDialog, {
      title: 'Stimme hinzufügen',
      data: {
        instrumentOptions,
        alternativeVoiceOptions,
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

  async openEditVoiceDialog(data: Voice): Promise<boolean | undefined> {
    const [instruments, voices] = await Promise.all([
      firstValueFrom(this.#instrumentService.load$()),
      firstValueFrom(
        this.#voiceService.load$({ includeInstrumentName: true, includeAlternateVoices: true }),
      ),
    ]);

    const selectedVoice = voices.find((voice) => voice.voiceId === data.voiceId) ?? data;

    const instrumentOptions = instruments.map((i) => ({
      label: i.name,
      value: i.instrumentId.toString(),
    }));

    const alternativeVoiceOptions = voices
      .filter((v) => v.voiceId !== data.voiceId)
      .map((v) => ({
        label: `${v.instrumentName ?? ''} ${v.name}`.trim(),
        value: v.voiceId.toString(),
      }));

    return this.#dialogService.open<boolean, VoiceDialogData>(AppVoiceDataDialog, {
      title: 'Stimme bearbeiten',
      data: {
        voice: selectedVoice,
        instrumentOptions,
        alternativeVoiceOptions,
      },
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '500px',
      },
    });
  }

  async openDeleteVoiceDialog(data: Voice): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, Voice>(VoiceDeleteDialog, {
      title: 'Stimme löschen',
      data: data,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'delete', text: 'Löschen', type: 'filled', color: 'error' },
      ],
    });
  }
}
