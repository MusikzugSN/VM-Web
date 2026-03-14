import {Component, inject} from '@angular/core';
import {DIALOG_BUTTON_CLICKS, DialogBase} from '@vm-utils/dialogs';
import {BehaviorSubject, firstValueFrom, map, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FileData, VmcFileUploader, VmcSelect, VmSelectOption} from '@vm-components';
import {CreateMultipleScore, ScoreService} from '@vm-utils/services';
import {AsyncPipe} from '@angular/common';
import { parse } from "csv-parse/browser/esm/sync";

@Component({
  selector: 'app-mulit-create-dialog',
  imports: [
    VmcFileUploader,
    VmcSelect,
    AsyncPipe
  ],
  templateUrl: './app-mulit-create-dialog.component.html',
  styleUrl: './app-mulit-create-dialog.component.scss',
})
export class AppScoreMulitCreateDialog extends DialogBase<boolean> {
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #scoreService = inject(ScoreService);

  #file$ = new BehaviorSubject<FileData | undefined>(undefined);
  #fileText$ = new BehaviorSubject<string | undefined>(undefined);
  headers$ = this.#fileText$.pipe(map(fileText => {
    if (fileText === undefined) {
      return undefined;
    }

    // Erste Zeile extrahieren
    const firstLine = fileText.split(/\r?\n/)[0];

    if (firstLine === undefined) {
      return undefined;
    }

    // CSV Header splitten (einfacher Fall)
    return firstLine.split(',').map(h => h.trim()).map(h => ({ label: h, value: h } as VmSelectOption));
  }));

  dtoFields = [
    'title',
    'composer',
    'link',
    'duration',
    'folderName',
    'number'
  ] as const;

  mapping$ = new BehaviorSubject<Record<string, string | null>>({});

  selectedHeaders$ = this.mapping$.pipe(
    map(mapObj =>
      Object.values(mapObj)
        .filter(v => v !== null) as string[]
    )
  );


  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'create') {
        const dto = this.#parseCsvToDtos();

        await firstValueFrom(this.#scoreService.createMultiple$(dto));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });

    this.#file$.pipe(takeUntilDestroyed()).subscribe(async fileData => {
      if (fileData === undefined) {
        return;
      }

      const fileText = await fileData.file.text();
      this.#fileText$.next(fileText);
    });
  }

  filesChanged(event: FileData[]): void {
    if (event.length <= 0) {
      this.#file$.next(undefined);
    }

    this.#file$.next(event[0]);
  }

  updateMapping(field: string, header: string | null) {
    const map = { ...this.mapping$.value };
    map[field] = header;
    this.mapping$.next(map);
  }

  #parseCsvToDtos(): CreateMultipleScore[] {
    const text = this.#fileText$.getValue();

    if (text === undefined) {
      return [];
    }

    const result = parse(text);

    if (result.length < 1) {
      return [];
    }

    const headers = result[0] as string[];
    const mapping = this.mapping$.value;

    const dtos: CreateMultipleScore[] = [];

    for (let i = 1; i < result.length; i++) {
      const cols = result[i] as string[];

      if (cols === undefined) {
        return [];
      }

      const get = (dtoField: string) => {
        const header = mapping[dtoField];
        if (!header) return null;
        const index = headers?.indexOf(header);

        if (index === undefined) {
          return null;
        }

        if (index === -1) return null;
        return cols[index];
      };

      dtos.push({
        title: get('title') ?? '',
        composer: get('composer') ?? '',
        link: get('link') ?? undefined,
        duration: get('duration') ? Number(get('duration')) : undefined,
        folderName: get('folderName') ?? undefined,
        number: get('number') ?? undefined
      });
    }

    return dtos;
  }
}
