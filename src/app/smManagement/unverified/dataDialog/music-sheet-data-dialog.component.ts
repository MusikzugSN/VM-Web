import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { VmcInputField, VmFormField, VmValidFormTypes } from '@vm-components';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { convertToPatch, Dictionary } from '@vm-utils';
import { firstValueFrom, map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MusicSheetService, ScoreService, VoiceService } from '@vm-utils/services';

export interface EditMusicSheetDialogData {
  musicSheetId: number;
  scoreId: number;
  name: string;
  composer: string;
  voiceId: number;
}

@Component({
  selector: 'app-music-sheet-data-dialog',
  imports: [VmcInputField, AsyncPipe],
  templateUrl: './music-sheet-data-dialog.component.html',
  styleUrl: './music-sheet-data-dialog.component.scss',
})
export class AppMusicSheetDataDialog extends DialogBase<boolean> {
  readonly #data = inject<EditMusicSheetDialogData>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #musicSheetService = inject(MusicSheetService);
  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);

  readonly #changedValues: Dictionary<string> = {};

  nameField: VmFormField = {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    value: this.#data.name,
  };

  composerField: VmFormField = {
    key: 'composer',
    label: 'Komponist',
    type: 'text',
    required: true,
    value: this.#data.composer,
  };

  voiceField$: Observable<VmFormField> = this.#voiceService.load$({ includeInstrumentName: true }).pipe(
    map((voices) => ({
      key: 'voiceId',
      label: 'Stimme',
      type: 'select',
      value: this.#data.voiceId.toString(),
      options: voices.map((v) => ({
        value: v.voiceId.toString(),
        label: [v.instrumentName, v.name].filter(Boolean).join(' '),
      })),
    }) as VmFormField),
  );

  voiceFieldPlaceholder: VmFormField = {
    key: 'voiceId',
    label: 'Stimme',
    type: 'select',
    options: [],
  };

  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'save') {
        const musicSheetPatch = convertToPatch<{ voiceId: number }, string>({
          voiceId: this.#changedValues['voiceId'] as string,
        });

        const scorePatch = convertToPatch<{ title: string; composer: string }, string>({
          title: this.#changedValues['name'] as string,
          composer: this.#changedValues['composer'] as string,
        });

        if (Object.keys(musicSheetPatch).length > 0) {
          await firstValueFrom(this.#musicSheetService.change$(musicSheetPatch, this.#data.musicSheetId));
        }

        if (Object.keys(scorePatch).length > 0) {
          await firstValueFrom(this.#scoreService.change$(scorePatch, this.#data.scoreId));
        }

        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue as string;
  }
}

