import {Component, inject, Signal} from '@angular/core';
import {
  FileData,
  VmcFileUploader,
  VmcInputField,
  VmFormField,  VmValidFormTypes,
} from '@vm-components';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {DIALOG_BUTTON_CLICKS, DialogBase} from '@vm-utils/dialogs';
import {ScoreService, VoiceService} from '@vm-utils/services';
import {AsyncPipe} from '@angular/common';
import {NumDictionary} from '@vm-utils';

@Component({
  selector: 'app-score-upload-step',
  imports: [VmcInputField, VmcFileUploader, AsyncPipe],
  templateUrl: './vmp-score-upload-dialog.component.html',
  styleUrl: './vmp-score-upload-dialog.component.scss',
})
export class VmpScoreUploadDialogComponent extends DialogBase<boolean> {
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);

  //#changedValues: Dictionary<string> = {};
  #VoiceIdToFilePath$ = new BehaviorSubject<NumDictionary<string>>({});


  scoreFieldPlaceholder: VmFormField = {
    type: 'select',
    label: 'Stück',
    key: 'scoreId',
    options: []
  };

  scoreField$: Observable<VmFormField> = this.#scoreService.load$().pipe(map(x => {
    return {
      key: 'scoreId',
      label: 'Stück',
      type: 'select',
      enableSearch: true,
      options: x.map(s => ({ label: s.title, value: s.scoreId.toString() })),
    };
  }));

  voiceFieldPlaceholder: VmFormField = {
    type: 'select',
    label: 'Stimme',
    key: 'voiceId',
    options: []
  };

  #voices = this.#voiceService.load$();

  voiceField$ = combineLatest([this.#voices, this.#VoiceIdToFilePath$])
    .pipe(map(([voices, usedVoices]) => {
        return voices.filter(v => !usedVoices[v.voiceId]);
      }),
      map((x) => {
        return {
          type: 'select',
          label: 'Stimme',
          key: 'voiceId',
          options: x.map(v => ({ label: v.name, value: v.voiceId.toString() })),
        } as VmFormField;
      })
    );

  #files$ = new BehaviorSubject<FileData[]>([]);
  files: Signal<FileData[]> = toSignal<FileData[], FileData[]>(this.#files$, { initialValue: [] });


  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      //const patch = convertToPatch<Score, VmValidFormTypes >(this.#changedValues);
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


  fileChangeEvent(files: FileData[]): void {
    this.#files$.next(files);
  }

  storeChangedValue(_newValue: VmValidFormTypes, _key: string): void {
    //this.valueChanged.emit({ key, value: newValue as string });
  }
}


