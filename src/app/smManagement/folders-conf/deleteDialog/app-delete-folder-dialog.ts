import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Folder, FoldersService } from '../../../me/folders/folders.service';

@Component({
  selector: 'app-delete-folder-dialog',
  imports: [],
  templateUrl: './app-delete-folder-dialog.html',
  styleUrl: './app-delete-folder-dialog.scss',
})
export class AppDeleteFolderDialog extends DialogBase<boolean>{
  readonly #data = inject<Folder>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #folderService = inject(FoldersService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#folderService.delete$(this.#data.musicFolderId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
