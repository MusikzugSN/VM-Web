import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { AppScoreDataDialog, ScoreDialogData } from './dataDialog/app-score-data-dialog.component';
import { VoiceService } from '../Stimmen-Instrumente/voice.service';
import { FoldersService } from '../../me/folders/folders.service';

@Injectable({
  providedIn: 'root',
})
export class RepositoryDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #voiceService = inject(VoiceService);
  readonly #foldersService = inject(FoldersService);

  async openAddScoreDialog(): Promise<boolean | undefined> {
    const voiceOptions = this.#voiceService.voiceListe.map((v) => ({
      label: `Stimme ${v.name} – ${v.instrumentName}`,
      value: v.voiceId.toString(),
    }));

    const folderOptions = this.#foldersService.mappenListe.map((f) => ({
      label: f.name,
      value: f.folderId.toString(),
    }));

    return this.#dialogService.open<boolean, ScoreDialogData>(AppScoreDataDialog, {
      title: 'Notenblatt hinzufügen',
      data: {
        voiceOptions,
        folderOptions,
        sheetMode: true,
      },
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '600px',
      },
    });
  }

  async openAddScoreDialogSimple(): Promise<boolean | undefined> {
    return this.#dialogService.open<boolean, ScoreDialogData>(AppScoreDataDialog, {
      title: 'Notenstück hinzufügen',
      data: {
        voiceOptions: [],
        folderOptions: [],
        simpleMode: true,
      },
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'create', text: 'Hinzufügen', type: 'filled' },
      ],
      dialogConfig: {
        minWidth: '600px',
      },
    });
  }
}

