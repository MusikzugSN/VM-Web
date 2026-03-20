import { Component, inject } from '@angular/core';
import {
  AsPipe,
  convertToPatch,
  Dictionary,
  nameOf, NumDictionary,
} from '@vm-utils';
import {BehaviorSubject, combineLatest, distinctUntilChanged, firstValueFrom, map, Observable} from 'rxjs';
import {
  VmcDataGrid,
  VmCheckboxValues,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EventMusicSheetTeaser, GroupService } from '@vm-utils/services';
import { AsyncPipe } from '@angular/common';
import {Folder, FolderMusicSheetTeaser, FoldersService, UpdateFolder} from '@vm-utils/services';
import {Score, ScoreService} from '@vm-utils/services';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar'

@Component({
  selector: 'app-folder-data-dialog',
  imports: [VmcInputField, AsyncPipe, AsPipe, VmcDataGrid],
  templateUrl: './app-folder-data-dialog.component.html',
  styleUrl: './app-folder-data-dialog.component.scss',
})
export class AppFolderDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Folder | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #groupService = inject(GroupService);
  readonly #folderService = inject(FoldersService);
  readonly #scoreService = inject(ScoreService);
  readonly #snackbarService = inject(SnackbarService);

  readonly #sheets: FolderMusicSheetTeaser[] = this.#data?.scores ?? [];

  #scores$: Observable<Score[]> = this.#scoreService.load$();

  // Datasource für die FolderMusicSheetTeaser, damit Änderungen direkt in der Tabelle sichtbar sind
  folderMusicSheetsData$: BehaviorSubject<FolderMusicSheetTeaser[]> = new BehaviorSubject<
    FolderMusicSheetTeaser[]
  >(this.#sheets);
  //lädt auswählbare Stücke
  #scoresOptions$: Observable<VmSelectOption[]> = combineLatest([
    this.#scores$,
    this.folderMusicSheetsData$,
  ]).pipe(
    map(([scores, setScores]) => {
      const usedScoreIds = setScores.map((x) => x.scoreId);
      return scores.filter((score) => !usedScoreIds.includes(score.scoreId));
    }),
    map((x) => x.map((score) => ({ label: score.title, value: score.scoreId.toString() }))),
  );

  scoreOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#scoresOptions$, {
    initialValue: [],
  });

  #scoresById$: Observable<NumDictionary<Score>> = this.#scores$.pipe(
    map((x) =>
      x.reduce((acc, score) => ({ ...acc, [score.scoreId]: score }), {} as NumDictionary<Score>),
    ),
  );

  scoresById = toSignal<NumDictionary<Score>, NumDictionary<Score>>(this.#scoresById$, {
    initialValue: {},
  });

  // @ts-expect-error
  ScoreType: Score;

  // Hier werden alle geänderten Werte zwischengespeichert, damit sie beim Speichern in einem Patch-Objekt zusammengefasst werden können
  #changedValues: Dictionary<VmValidFormTypes | boolean | FolderMusicSheetTeaser[]> = {};
  #changedGroupValues: FolderMusicSheetTeaser[] = [];

  nameField: VmFormField = {
    label: 'Name',
    type: 'text',
    key: nameOf<UpdateFolder>('name'),
    required: true,
    value: this.#data?.name,
    placeholder: 'z. B. 1. Mappe',
    maxLength: 24,
  };

  numberOfScoreField$: Observable<VmFormField> = this.folderMusicSheetsData$.pipe(
    map((sheets) => {
      const numbers = sheets
        .map((x) => Number(x.number))
        .filter((x) => !Number.isNaN(x))
        .sort((a, b) => a - b);
      const maxNumber = numbers[numbers.length - 1] ?? 0;
      return {
        key: nameOf<EventMusicSheetTeaser>('number'),
        label: 'Nummer',
        type: 'text',
        value: (maxNumber + 1).toString(),
      } as VmFormField;
    }),
  );

  numberOfScoreFieldPlaceholder: VmFormField = {
    key: nameOf<FolderMusicSheetTeaser>('number'),
    label: 'Nummer',
    type: 'text',
    placeholder: 'z. B. 1',
  };

  #groups$ = this.#groupService.load$();
  groupSelectorField$: Observable<VmFormField> = this.#groups$.pipe(
    distinctUntilChanged(),
    map((groups) => {
      return {
        label: 'Gruppe',
        type: 'select',
        key: nameOf<UpdateFolder>('groupId'),
        value: this.#data?.groupId?.toString() ?? '',
        options: [...groups.map((x) => ({ label: x.name, value: x.groupId.toString() }))],
        required: true,
      } as VmFormField;
    }),
    takeUntilDestroyed(),
  );

  groupSelectorFieldPlaceholder: VmFormField = {
    key: nameOf<UpdateFolder>('groupId'),
    label: 'Gruppe',
    type: 'select',
    options: [],
  };

  folderScoreColumns: VmColumn<FolderMusicSheetTeaser>[] = [
    {
      key: 'number',
      header: 'Nummer',
      field: nameOf<FolderMusicSheetTeaser>('number'),
      footerAsTemplate: true,
    },
    {
      key: 'score',
      header: 'Stück',
      field: nameOf<FolderMusicSheetTeaser>('scoreId'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  folderScoresActions: VmRowAction[] = [
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

  #musicSheetTeaser: FolderMusicSheetTeaser = {
    number: '-1',
    scoreId: -1,
  };

  showInMyAreaField: VmFormField = {
    label: 'Zeig in Meinem Bereich',
    type: 'checkbox',
    key: nameOf<Folder>('showInMyArea'),
    value: this.#data?.showInMyArea ? 'checked' : 'unchecked',
    labelPosition: 'before',
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Folder, VmValidFormTypes | boolean | FolderMusicSheetTeaser[]>(
        this.#changedValues,
      );
      if (x === 'save') {
        try {
          patch.musicFolderId = this.#data?.musicFolderId ?? -1;
          await firstValueFrom(this.#folderService.change$(patch, patch.musicFolderId));
          super.closeDialog(true);
        } catch {
          this.#snackbarService.raiseError('Speichern fehlgeschlagen. Bitte pruefe die Zuordnungen.', 5000);
        }
        return;
      }

      if (x === 'create') {
        try {
          await firstValueFrom(this.#folderService.create$(patch));
          super.closeDialog(true);
        } catch {
          this.#snackbarService.raiseError('Erstellen fehlgeschlagen. Bitte pruefe die Eingaben.', 5000);
        }
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(
    newValue: VmValidFormTypes | boolean | FolderMusicSheetTeaser[],
    key: string,
  ): void {
    this.#changedValues[key] = newValue;
  }

  storeBooleanChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.storeChangedValue(this.#checkboxToBool(newValue), key);
  }

  #storeChangedGroupValues(): void {
    this.storeChangedValue(this.#changedGroupValues, nameOf<Folder>('scores'));

    const oldData = this.#sheets;
    let newData = [...oldData];
    for (const changedGroupValue of this.#changedGroupValues) {
      if (changedGroupValue.deleted) {
        newData = newData.filter(
          (x) =>
            !(x.number === changedGroupValue.number && x.scoreId === changedGroupValue.scoreId),
        );
      } else {
        newData.push(changedGroupValue);
      }
    }

    this.storeChangedValue(newData.filter((x) => !x.deleted).length, nameOf<UpdateFolder>('membercount'));
    this.folderMusicSheetsData$.next(newData);
  }

  #storeNewScoreValue(newValue: FolderMusicSheetTeaser): void {
    const normalizedNumber = newValue.number.trim();

    const normalizedValue: FolderMusicSheetTeaser = {
      ...newValue,
      number: normalizedNumber.toString(),
    };

    // der Eintrag existiert bereits in den aktuellen Werten, also muss er nicht erneut hinzugefügt werden
    const currentValues = this.folderMusicSheetsData$.getValue();
    if (currentValues.find((x) => x.number === normalizedValue.number || x.scoreId === normalizedValue.scoreId)) {
      this.#snackbarService.raiseError(
        'Die Nummer oder das Stück existiert bereits in der Mappe.',
        2500,
      );
      return;
    }

    // Der Eintrag wurde gelöscht und muss nun wieder hinzugefügt werden, also muss er aus den gelöschten Werten entfernt werden
    if (
      this.#changedGroupValues.find(
        (x) => x.number === normalizedValue.number || (x.scoreId === normalizedValue.scoreId && x.deleted),
      )
    ) {
      this.#changedGroupValues = this.#changedGroupValues.filter(
        (x) => !((x.number === normalizedValue.number || x.scoreId === normalizedValue.scoreId) && x.deleted),
      );
    } else {
      this.#changedGroupValues.push({
        scoreId: normalizedValue.scoreId,
        number: normalizedValue.number,
      });
    }

    this.#storeChangedGroupValues();
  }

  #storeDeletedScoreValue(deletedValue: FolderMusicSheetTeaser): void {
    if (
      this.#changedGroupValues.find(
        (x) => x.number === deletedValue.number && x.scoreId === deletedValue.scoreId,
      )
    ) {
      // Wenn die gelöschte Gruppe bereits in den Änderungen enthalten ist, muss sie entfernt werden, da sie sonst fälschlicherweise als neue Gruppe interpretiert werden könnte
      this.#changedGroupValues = this.#changedGroupValues.filter(
        (x) => !(x.number === deletedValue.number && x.scoreId === deletedValue.scoreId),
      );
    } else {
      // Wenn die gelöschte Gruppe nicht in den Änderungen enthalten ist, muss sie mit dem "deleted"-Flag gespeichert werden, damit sie beim Speichern gelöscht wird
      deletedValue.deleted = true;
      this.#changedGroupValues.push(deletedValue);
    }
    this.#storeChangedGroupValues();
  }

  storeNewNumberChange(value: VmValidFormTypes): void {
    this.#musicSheetTeaser.number = value.toString().trim();
  }
  // merkt sich auswgewähltes Stück
  storeNewScoreChange(value: VmValidFormTypes): void {
    this.#musicSheetTeaser.scoreId = Number.parseInt(value as string, 10);
  }

  execActionFromRow(event: VmRowClickedEvent<FolderMusicSheetTeaser>): void {
    if (event.key === 'delete') {
      if (event.rowData === null) {
        return;
      }
      this.#storeDeletedScoreValue(event.rowData);
    } else if (event.key === 'add') {
      if (this.#musicSheetTeaser.scoreId !== -1) {
        this.#storeNewScoreValue(this.#musicSheetTeaser);
      } // todo far: handle error
    }
  }
  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }
}
