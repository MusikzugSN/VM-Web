import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { VmpPrintDialog } from './print-dialog/vmp-print-dialog.component';
import { VmpScoreUploadDialogComponent } from './score-upload-dialog/vmp-score-upload-dialog.component';
import { VmpMultiScoreUploadDialog } from './multi-score-upload-dialog/vmp-multi-score-upload-dialog.component';
import { PrintService } from './print-dialog/print.service';
import { ConfigService } from '@vm-utils';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VmpNotesFullpageDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #printService = inject(PrintService);
  readonly #config = inject(ConfigService);
  readonly #router = inject(Router);

  async openPrintDialog(
    selectedIds?: number[],
    files?: { url: string; filename: string }[],
  ): Promise<boolean | undefined> {
    return this.#dialogService.open(VmpPrintDialog, {
      data: { selectedIds, files },
      title: 'Drucken',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'print', text: 'Drucken', type: 'filled' },
      ],
    });
  }

  async printSingleWithSystemDialog(selectedIds: number[], marschbuch = false): Promise<boolean> {
    if (selectedIds.length !== 1) {
      return false;
    }

    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      return false;
    }

    try {
      const filePath = await firstValueFrom(
        this.#printService.createPrintUrl$(selectedIds, marschbuch),
      );
      const config = await firstValueFrom(this.#config.config$);
      const baseUrl = config?.backedApiUrl ?? window.location.origin;
      const fileUrl = new URL(filePath, baseUrl).toString();

      popup.location.href = fileUrl;

      const triggerPrint = (): void => {
        popup.focus();
        popup.print();
      };

      popup.onload = triggerPrint;
      setTimeout(triggerPrint, 1200);

      return true;
    } catch {
      popup.close();
      return false;
    }
  }

  async openAddNoteSheetDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(VmpScoreUploadDialogComponent, {
      data: undefined,
      title: 'Notenblatt hinzufügen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'upload', text: 'Hinzufügen', type: 'filled' },
      ],
    });
  }

  async openAddMoreNoteSheetDialog(): Promise<boolean | undefined> {
    return this.#dialogService.open(VmpMultiScoreUploadDialog, {
      data: undefined,
      title: 'Mehrere Notenblätter hinzufügen',
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'toViewer', text: 'Weiter', type: 'filled' },
      ],
    });
  }
  async openVerifyDialog(): Promise<boolean | undefined> {
    return this.#router.navigate(['/verifyViewer'])
  }
}
