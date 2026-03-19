import { Component, inject } from '@angular/core';
import {
  AsPipe,
  convertToDisplayMinutes,
  convertToDurationValue,
  convertToPatch,
  Dictionary,
  nameOf,
  NumDictionary,
} from '@vm-utils';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmRowClickedEvent, VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import {
  Folder,
  FoldersService,
  Score,
  ScoreFolderEntry,
  ScoreService,
} from '@vm-utils/services';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable } from 'rxjs';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-score-info-step',
  imports: [
    VmcInputField,
    FormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    AsyncPipe,
    VmcDataGrid,
    AsPipe,
  ],
  templateUrl: './app-repository-data-dialog.component.html',
  styleUrl: './app-repository-data-dialog.component.scss',
})
export class AppRepositoryDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Score | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #scoreService = inject(ScoreService);
  readonly #snackbarService = inject(SnackbarService);
  readonly #foldersService = inject(FoldersService);

  scoreData$: BehaviorSubject<ScoreFolderEntry[]> = new BehaviorSubject<ScoreFolderEntry[]>(this.#data?.musicFolders ?? []);
  #folders$: Observable<Folder[]> = this.#foldersService.load$();

  #changedValues: Dictionary<string> = {};
  #changedValuesFolderEntry: Dictionary<VmValidFormTypes | boolean | ScoreFolderEntry[]> = {};
  #changedScoreValues: ScoreFolderEntry[] = [];
  durationDisplay = '';

  #folderById$: Observable<NumDictionary<Folder>> = this.#folders$.pipe(
    map((x) =>
      x.reduce(
        (acc, folder) => ({ ...acc, [folder.musicFolderId]: folder }),
        {} as NumDictionary<Folder>,
      ),
    ),
  );

  folderById = toSignal<NumDictionary<Folder>, NumDictionary<Folder>>(
    this.#folderById$,
    {
      initialValue: {},
    },
  );

  titleField: VmFormField = {
    label: 'Titel',
    type: 'text',
    key: nameOf<Score>('title'),
    value: this.#data?.title ?? '',
    placeholder: 'z. B. Pirates of the Caribbean',
    required: true,
  };

  composerField: VmFormField = {
    label: 'Komponist',
    type: 'text',
    key: nameOf<Score>('composer'),
    value: this.#data?.composer ?? '',
    placeholder: 'z. B. Hans Zimmer',
    required: true,
  };

  linkField: VmFormField = {
    label: 'Link',
    type: 'url',
    key: nameOf<Score>('link'),
    value: this.#data?.link ?? '',
    placeholder: 'z. B. https://youtube.com/',
  };

  scoreColumns: VmColumn<ScoreFolderEntry>[] = [
    {
      key: 'number',
      header: 'Nummer',
      field: nameOf<ScoreFolderEntry>('number'),
      footerAsTemplate: true,
    },
    {
      key: 'folder',
      header: 'Mappe',
      field: nameOf<ScoreFolderEntry>('musicFolderId'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];
  ScoresActions: VmRowAction[] = [
    {
      key: 'delete',
      icon: 'delete',
    },
  ];
  footerActions: VmRowAction[] = [
    {
      key: 'add',
      icon: 'add',
    },
  ];

  #folderEntry: ScoreFolderEntry = {
    number: -1,
    musicFolderId: -1,
  };

  // @ts-ignore
  ScoreType: ScoreFolderEntry;

  #foldersOptions$: Observable<VmSelectOption[]> = combineLatest([
    this.#folders$,
    this.scoreData$.asObservable(),
  ]).pipe(
    map(([folders, setFolders]) => {
      const usedFolderIds = new Set(setFolders.map((x) => x.musicFolderId));
      return folders.filter((folder) => !usedFolderIds.has(folder.musicFolderId));
    }),
    map((folders) => folders.map((folder) => ({ label: folder.name, value: folder.name }))),
  );

  folderOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#foldersOptions$, {
    initialValue: [],
  });

  numberOfScoreField$: Observable<VmFormField> = this.scoreData$.asObservable().pipe(
    map((entries) => {
      const maxNumber = entries.length > 0 ? Math.max(...entries.map((x) => Number(x.number) || 0)) : 0;

      return {
        key: nameOf<ScoreFolderEntry>('number'),
        label: 'Nummer',
        type: 'text',
        value: maxNumber + 1,
      } as VmFormField;
    }),
  );

  numberOfScoreFieldPlaceholder: VmFormField = {
    key: nameOf<ScoreFolderEntry>('number'),
    label: 'Nummer',
    type: 'text',
    placeholder: 'z. B. 1',
  };

  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const rawPatch = convertToPatch<Score, string>(this.#changedValues);

      // Leere Strings und null entfernen, duration als number konvertieren
      const patch: Partial<Score> = Object.fromEntries(
        Object.entries(rawPatch)
          .filter(([k, v]) => v !== '' && v !== null && !(k === 'duration' && !Number(v)))
          .map(([k, v]) => (k === 'duration' ? [k, Number(v)] : [k, v])),
      ) as Partial<Score>;

      if (x === 'save') {
        patch.scoreId = this.#data?.scoreId ?? -1;
        await firstValueFrom(this.#scoreService.change$(patch, patch.scoreId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        try {
          await firstValueFrom(this.#scoreService.create$(patch));
        } catch (err: unknown) {
          const httpErr = err as { status?: number };
          // 303 = Backend hat erstellt, antwortet mit Redirect
          if (httpErr?.status !== 303) {
            throw err;
          }
        }
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });

    if (this.#data?.duration) {
      this.durationDisplay = convertToDisplayMinutes(this.#data?.duration ?? 0);
    }
  }

  onDurationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/[^0-9]/g, '');

    if (raw.length > 4) {
      raw = raw.substring(0, 4);
    }

    if (raw.length >= 2) {
      this.durationDisplay = raw.substring(0, 2) + ':' + raw.substring(2);
    } else {
      this.durationDisplay = raw;
    }

    input.value = this.durationDisplay;
    this.storeChangedValue(convertToDurationValue(this.durationDisplay), 'duration');
  }

  storeChangedValue(value: string | number, key: string): void {
    this.#changedValues[key] = value.toString();
  }
  storeChangedScoreValue(
    newValue: VmValidFormTypes | boolean | ScoreFolderEntry[],
    key: string,
  ): void {
    this.#changedValuesFolderEntry[key] = newValue;
  }
  #storeChangedScoreValues(): void {
    this.storeChangedScoreValue(this.#changedScoreValues, nameOf<ScoreFolderEntry>('number'));

    const oldData = this.#data?.musicFolders ?? [];
    let newData = [...oldData];
    for (const changedScoreValue of this.#changedScoreValues) {
      if (changedScoreValue.deleted) {
        newData = newData.filter(
          (x) =>
            !(
              x.number === changedScoreValue.number &&
              x.musicFolderId === changedScoreValue.musicFolderId
            ),
        );
      } else {
        newData.push(changedScoreValue);
      }
    }

    this.scoreData$.next(newData);
  }
  #storeNewGroupValue(newValue: ScoreFolderEntry): void {
    // der Eintrag existiert bereits in den aktuellen Werten, also muss er nicht erneut hinzugefügt werden
    const currentValues = this.scoreData$.getValue();
    if (
      currentValues.find(
        (x) => x.number === newValue.number || x.musicFolderId === newValue.musicFolderId,
      )
    ) {
      this.#snackbarService.raiseError(
        'Die Nummer oder das Stück existiert bereits in der Mappe.',
        2500,
      );
      return;
    }

    // Der Eintrag wurde gelöscht und muss nun wieder hinzugefügt werden, also muss er aus den gelöschten Werten entfernt werden
    if (
      this.#changedScoreValues.find(
        (x) => x.number === newValue.number || x.musicFolderId === newValue.musicFolderId,
      )
    ) {
      this.#changedScoreValues = this.#changedScoreValues.filter(
        (x) => !(x.number === newValue.number || x.musicFolderId === newValue.musicFolderId),
      );
    } else {
      this.#changedScoreValues.push({
        musicFolderId: newValue.musicFolderId,
        number: newValue.number,
      });
    }

    this.#storeChangedScoreValues();
  }
  #storeDeletedScoreValue(deletedValue: ScoreFolderEntry): void {
    if (
      this.#changedScoreValues.find(
        (x) =>
          x.number === deletedValue.number && x.musicFolderId === deletedValue.musicFolderId,
      )
    ) {
      // Wenn die gelöschte Gruppe bereits in den Änderungen enthalten ist, muss sie entfernt werden, da sie sonst fälschlicherweise als neue Gruppe interpretiert werden könnte
      this.#changedScoreValues = this.#changedScoreValues.filter(
        (x) =>
          !(x.number === deletedValue.number && x.musicFolderId === deletedValue.musicFolderId),
      );
    } else {
      // Wenn die gelöschte Gruppe nicht in den Änderungen enthalten ist, muss sie mit dem "deleted"-Flag gespeichert werden, damit sie beim Speichern gelöscht wird
      this.#changedScoreValues.push(deletedValue);
    }
    this.#storeChangedScoreValues();
  }

  storeNewNumberChange(value: VmValidFormTypes): void {
    this.#folderEntry.number = Number(value);
  }

  storeNewFolderChange(value: VmValidFormTypes): void {
    this.#folderEntry.musicFolderId = Number(value);
  }

  execActionFromRow(score: VmRowClickedEvent<ScoreFolderEntry>): void {
    if (score.key === 'delete') {
      if (score.rowData === null) {
        return;
      }
      this.#storeDeletedScoreValue(score.rowData);
    } else if (score.key === 'add') {
      if (this.#folderEntry.number !== -1) {
        this.#storeNewGroupValue(this.#folderEntry);
      } // todo far: handle error
    }
  }
}
