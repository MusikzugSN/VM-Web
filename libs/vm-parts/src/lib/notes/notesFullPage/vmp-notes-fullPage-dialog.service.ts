import { inject, Injectable } from '@angular/core';
import { VmDialogService } from '@vm-utils/dialogs';
import { VmpPrintDialog } from './print-dialog/vmp-print-dialog.component';
import { VmpScoreUploadDialogComponent } from './score-upload-dialog/vmp-score-upload-dialog.component';
import { VmpMultiScoreUploadDialog } from './multi-score-upload-dialog/vmp-multi-score-upload-dialog.component';
import { VmpNotesTagDialogComponent } from './tag-dialog/vmp-notes-tag-dialog.component';
import {PrintService} from './print-dialog/print.service';
import {firstValueFrom} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class VmpNotesFullpageDialogService {
  readonly #dialogService = inject(VmDialogService);
  readonly #printService = inject(PrintService);
  //readonly #config = inject(ConfigService);

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

    // We open a popup synchronously to preserve the user gesture (browsers
    // often block window.print when called asynchronously). The popup is
    // written with an <embed> of the Blob object URL so the PDF is rendered
    // inline (no download). We then call print() and close the popup.
    const popup = window.open('', '_blank');
    if (!popup) return false;

    const token = await firstValueFrom(this.#printService.createDownloadUrl$(selectedIds, false, marschbuch));
    const blob = await firstValueFrom(
      this.#printService.downloadByToken$(token),
    );

    const objectUrl = URL.createObjectURL(blob);

    const mime = blob.type || 'application/pdf';
    const html = `<!doctype html><html><head><title>Print</title></head><body style="margin:0"><embed width="100%" height="100%" src="${objectUrl}" type="${mime}"></embed></body></html>`;
    popup.document.open();
    popup.document.write(html);
    // Give the embed some time to render, then trigger print and close.
    setTimeout(() => {
        popup.focus();
        popup.print();
    }, 700);

      return true;
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

  async openTagDialog(notesId: number, name: string, voice: string): Promise<boolean | undefined> {
    const title = `${name} - ${voice}`;

    return this.#dialogService.open(VmpNotesTagDialogComponent, {
      data: { notesId },
      title,
      buttons: [
        { key: 'close', text: 'Abbrechen', type: 'elevated' },
        { key: 'save', text: 'Speichern', type: 'filled' },
      ],
    });
  }
}
