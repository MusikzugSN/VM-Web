import { Component, inject, Signal } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DialogBase } from '@vm-utils/dialogs';
import {
  FileData,
  VmcFileUploader
} from '@vm-components';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SnackbarService } from '@vm-utils/snackbar';
import { Router } from '@angular/router';
import { NoteViewerSelectionService } from '../../noteViewer/note-viewer-selection.service';

@Component({
  selector: 'vmp-multi-score-upload-dialog.component',
  imports: [VmcFileUploader],
  templateUrl: './vmp-multi-score-upload-dialog.component.html',
  styleUrl: './vmp-multi-score-upload-dialog.component.scss',
})
export class VmpMultiScoreUploadDialog extends DialogBase<boolean> {
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #snackbarService = inject(SnackbarService);
  readonly #router = inject(Router);
  readonly #viewerSelection = inject(NoteViewerSelectionService);



  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'toViewer') {
        const files = this.files();

        if (files.length === 0) {
          this.#snackbarService.raiseError('Es muss ein Datei ausgewählt sein.');
          return;
        }

        this.#viewerSelection.setFiles(files);
        await this.#router.navigate(['/viewer']);
        super.closeDialog(true);

      }

      if(x === 'close') {
        super.closeDialog(true);
      }
    });
  }



  #files$ = new BehaviorSubject<FileData[]>([]);
  files: Signal<FileData[]> = toSignal<FileData[], FileData[]>(this.#files$, { initialValue: [] });

  fileChangeEvent(files: FileData[]): void {
    this.#files$.next(files);
  }
}
