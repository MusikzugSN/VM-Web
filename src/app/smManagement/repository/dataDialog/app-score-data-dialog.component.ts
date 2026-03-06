import { Component, inject } from '@angular/core';
import {
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
} from '@vm-utils';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmSelectOption } from '@vm-components';
import { Score } from '../score.service';
import { ScoreInfoStepComponent } from './score-info-step/score-info-step.component';
import { ScoreUploadStepComponent } from '../../../../../libs/vm-parts/src/lib/notes/notesFullPage/score-upload-step/score-upload-step.component';


export interface ScoreDialogData {
  score?: Score;
  voiceOptions: VmSelectOption[];
  folderOptions: VmSelectOption[];
  simpleMode?: boolean;
  sheetMode?: boolean;
}

@Component({
  selector: 'app-score-data-dialog',
  imports: [ScoreInfoStepComponent, ScoreUploadStepComponent],
  templateUrl: './app-score-data-dialog.component.html',
  styleUrl: './app-score-data-dialog.component.scss',
})
export class AppScoreDataDialog extends DialogBase<boolean> {
  readonly #data = inject<ScoreDialogData | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  currentStep: number;

  #changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.currentStep = this.#data?.sheetMode ? 2 : 1;

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'create') {
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(event: { key: string; value: string }): void {
    this.#changedValues[event.key] = event.value;
  }
}
