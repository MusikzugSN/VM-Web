import {Component, inject, Signal} from '@angular/core';
import {
  FileData,
  VmcFileUploader,
  VmcInputField,
  VmFormField, VmSelectOption, VmValidFormTypes,
} from '@vm-components';
import {BehaviorSubject, firstValueFrom, map, Observable, shareReplay} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {DIALOG_BUTTON_CLICKS, DialogBase} from '@vm-utils/dialogs';
import {ScoreService, VoiceService} from '@vm-utils/services';
import {AsyncPipe} from '@angular/common';
import {Dictionary} from '@vm-utils';
import {FileService, UploadScoreFilesRequest} from './file.service';
import {SnackbarService} from '@vm-utils/snackbar';
import {VmcSelect} from '@vm-components';

@Component({
  selector: 'app-score-upload-step',
  imports: [VmcInputField, VmcFileUploader, AsyncPipe, VmcSelect],
  templateUrl: './vmp-score-upload-dialog.component.html',
  styleUrl: './vmp-score-upload-dialog.component.scss',
})
export class VmpScoreUploadDialogComponent extends DialogBase<boolean> {
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);
  readonly #fileService = inject(FileService);
  readonly #snackbarService = inject(SnackbarService);

  #voiceIdToFilePath$ = new BehaviorSubject<Dictionary<string>>({});
  #scoreId = new BehaviorSubject<string | undefined>(undefined);

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

  voices$ = this.#voiceService.load$({ includeInstrumentName: true })
    .pipe(shareReplay({ bufferSize: 1, refCount: true}), map(x => {
      return x.map(v => {
        return {
          value: v.voiceId.toString(),
          label: v.instrumentName + ' ' + v.name,
        } as VmSelectOption;
      })
    }));

  selectedVoiceIds$ = this.#voiceIdToFilePath$.pipe(
    map(dict =>
      Object.keys(dict)
        .map(k => k)
    )
  );


  #files$ = new BehaviorSubject<FileData[]>([]);
  files: Signal<FileData[]> = toSignal<FileData[], FileData[]>(this.#files$, { initialValue: [] });


  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      //const patch = convertToPatch<Score, VmValidFormTypes >(this.#changedValues);
      if (x === 'upload') {
        const scoreId = this.#scoreId.getValue();

        if (scoreId === undefined) {
          this.#snackbarService.raiseError("Es muss ein Stück ausgewählt sein.")
          return;
        }

        const files = this.files();
        const voiceMap = this.#voiceIdToFilePath$.getValue(); // { [voiceId]: filePath }


        if (files.length > Object.values(voiceMap).length) {
          console.log(voiceMap)
          this.#snackbarService.raiseError("Allen Datein muss eine Stimme zugeordnet werden.")
          return;
        }

        const req: UploadScoreFilesRequest = {
          scoreId: Number(scoreId),
          files: files.map(f => {
            // passende voiceId anhand des file.path finden
            const voiceId = Number(
              Object.keys(voiceMap).find(v => voiceMap[v] === f.path)
            );

            return {
              fileName: f.file.name,
              voiceId,
              file: f.file
            };
          })
        };

        await firstValueFrom(this.#fileService.uploadScoreFiles$(req));
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

  storeChangedValue(newValue: VmValidFormTypes, file: string): void {
    const currentVoiceIds = this.#voiceIdToFilePath$.getValue();
    currentVoiceIds[newValue.toString()] = file;
    this.#voiceIdToFilePath$.next(currentVoiceIds);
  }

  storeScoreId(scoreId: VmValidFormTypes): void {
    this.#scoreId.next(scoreId.toString());
  }
}


