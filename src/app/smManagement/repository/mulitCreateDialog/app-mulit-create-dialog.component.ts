import {Component, inject} from '@angular/core';
import {DIALOG_BUTTON_CLICKS, DialogBase} from '@vm-utils/dialogs';
import { Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { VmcFileUploader} from '@vm-components';
@Component({
  selector: 'app-mulit-create-dialog',
  imports: [
    VmcFileUploader
  ],
  templateUrl: './app-mulit-create-dialog.component.html',
  styleUrl: './app-mulit-create-dialog.component.scss',
})
export class AppScoreMulitCreateDialog extends DialogBase<boolean> {
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  //#file$ = new BehaviorSubject<FileData | undefined>(undefined);

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {


      if (x === 'create') {
        //await firstValueFrom(this.#scoreService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

 //filesChanged(event: FileData[]):
}
