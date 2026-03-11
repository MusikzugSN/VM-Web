import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils';
import { VmSelectOption } from '@vm-components';
import { VmpPrintDialog } from './print-dialog/vmp-print-dialog.component';
import { RepositoryDialogService } from '../../../../../../src/app/smManagement/repository/repository-dialog.service';
import { VoiceService } from '../../../../../../src/app/smManagement/Stimmen-Instrumente/voice.service';
import { AppScoreDataDialog, ScoreDialogData } from '../../../../../../src/app/smManagement/repository/dataDialog/app-score-data-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PrintDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #repoDialogService = inject(RepositoryDialogService);
  readonly #voiceService = inject(VoiceService);

  async openPrintDialog(selectedIds?: number[]): Promise<boolean | undefined> {
    console.log('Opening print dialog with selected notes:', selectedIds);
    return this.#dialogService.open(VmpPrintDialog, {
      data: { selectedIds },
      title: 'Drucken',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'print', text: 'Drucken', type: 'filled' },
      ],
    });
  }

  async openAddScoreInfoDialog(): Promise<boolean | undefined> {
    return this.#repoDialogService.openScoreInfoDialog();
  }

  async openAddScoreDialog(): Promise<boolean | undefined> {
    const voiceOptions = this.#voiceService.voiceListe.map((v) => ({
      label: `Stimme ${v.name} – ${v.instrumentName}`,
      value: v.voiceId.toString(),
    }));

    const folderOptions: VmSelectOption[] = [];

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
}
