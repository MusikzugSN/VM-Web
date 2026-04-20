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

    // Write a small HTML into the popup that listens for a postMessage with the
    // object URL and then embeds it and triggers print. We use postMessage so
    // the parent can perform async downloads while the popup was opened
    // synchronously (preserving the user gesture).
    const popupHtml = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Drucken</title></head><body style="margin:0;background:#fff"><div id="content"></div><script>
      (function(){
        function printBlob(url){
          try{
            var iframe = document.createElement('iframe');
            iframe.style.border = '0';
            iframe.style.width='100%'; iframe.style.height='100%';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = function(){
              setTimeout(function(){
                try{ window.focus(); window.print(); }catch(e){}
                try{ window.close(); }catch(e){}
              }, 200);
            };
          }catch(e){}
        }
        window.addEventListener('message', function(e){
          try{
            var data = e.data;
            // accept only our print messages
            if(data && data.type === 'print' && typeof data.objectUrl === 'string'){
              printBlob(data.objectUrl);
            }
          }catch(e){}
        }, false);
        // notify opener that popup is ready to receive the objectUrl
        try{ if(window.opener) window.opener.postMessage({ type: 'popup-ready' }, '*'); }catch(e){}
      })();
    <\/script></body></html>`;

    popup.document.open();
    popup.document.write(popupHtml);
    popup.document.close();

    // Start the async download in the parent while the popup is readying.
    const token = await firstValueFrom(this.#printService.createDownloadUrl$(selectedIds, false, marschbuch));
    const blob = await firstValueFrom(
      this.#printService.downloadByToken$(token),
    );

    const objectUrl = URL.createObjectURL(blob);
    const mime = blob.type || 'application/octet-stream';

    // If the response is not a PDF the popup can't render it — fallback to download
    if (!mime.includes('pdf')) {
      // trigger download in opener and close popup
      try {
        const ext = mime.includes('zip') ? 'zip' : 'bin';
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `noten.${ext}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
      try { URL.revokeObjectURL(objectUrl); } catch {}
      try { popup.close(); } catch {}
      return true;
    }

    // Fallback: send after 800ms if not already sent
    setTimeout(() => {
      try {
        if (!popup.closed) {
          popup.postMessage({ type: 'print', objectUrl: objectUrl, mime: mime }, '*');
        }
      } catch {}
    }, 800);

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
