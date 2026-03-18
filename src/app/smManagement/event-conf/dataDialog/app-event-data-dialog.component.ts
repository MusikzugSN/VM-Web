import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
} from 'rxjs';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmRowClickedEvent,
  VmValidFormTypes,
  VmSelectOption,
  VmCheckboxValues,
} from '@vm-components';
import { AsPipe, convertToPatch, Dictionary, nameOf, NumDictionary } from '@vm-utils';
import {
  Event,
  EventMusicSheetTeaser,
  EventService,
  Group,
  GroupService,
  Score,
  ScoreService,
} from '@vm-utils/services';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar';

@Component({
  selector: 'app-event-data-dialog.component',
  imports: [VmcInputField, VmcDataGrid, AsyncPipe, AsPipe],
  templateUrl: './app-event-data-dialog.component.html',
  styleUrl: './app-event-data-dialog.component.scss',
})
export class AppEventDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Event | undefined>(DIALOG_DATA);
  readonly #groupService = inject(GroupService);
  readonly #scoreService = inject(ScoreService);
  readonly #eventService = inject(EventService);
  readonly #snackbarService = inject(SnackbarService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  groupsdata$: Observable<Group[]> = this.#groupService.load$();
  #scores$: Observable<Score[]> = this.#scoreService.load$(); //Stücke laden

  //Datenquelle
  eventMusicSheetsData$: BehaviorSubject<EventMusicSheetTeaser[]> = new BehaviorSubject<
    EventMusicSheetTeaser[]
  >(this.#data?.sheets ?? []);

  #scoresOptions$: Observable<VmSelectOption[]> = combineLatest([
    this.#scores$,
    this.eventMusicSheetsData$,
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
  ScoreType: EventMusicSheetTeaser;

  #changedValues: Dictionary<VmValidFormTypes | boolean | EventMusicSheetTeaser[]> = {};
  #changedSheetValues: EventMusicSheetTeaser[] = [];

  #musicSheetTeaser: EventMusicSheetTeaser = {
    number: '',
    scoreId: -1,
  };

  eventNameField: VmFormField = {
    type: 'text',
    key: nameOf<Event>('name'),
    label: 'Eventname',
    required: true,
    value: this.#data?.name ?? '',
    placeholder: 'z. B. Die Schlager Camper',
  };
  eventDateField: VmFormField = {
    type: 'date',
    key: nameOf<Event>('activUntil'),
    label: 'Datum',
    required: true,
    value: this.#data?.activUntil ?? '',
  };

  groupSelectorField$: Observable<VmFormField> = this.groupsdata$.pipe(
    distinctUntilChanged(),
    map((groups) => {
      return {
        label: 'Gruppe',
        type: 'select',
        key: nameOf<Event>('groupId'),
        value: this.#data?.groupId ?? '',
        options: [...groups.map((x) => ({ label: x.name, value: x.groupId + '' }))],
      } as VmFormField;
    }),
    takeUntilDestroyed(),
  );

  groupSelectorFieldPlaceholder: VmFormField = {
    key: nameOf<Group>('name'),
    label: 'Gruppe',
    type: 'select',
    options: [],
  };

  eventScoreColumns: VmColumn<EventMusicSheetTeaser>[] = [
    {
      key: 'number',
      header: 'Nummer',
      field: nameOf<EventMusicSheetTeaser>('number'),
    },
    {
      key: 'score',
      header: 'Stück',
      field: nameOf<EventMusicSheetTeaser>('scoreId'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  eventScoresActions: VmRowAction[] = [
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

  showInMyAreaField: VmFormField = {
    label: 'Zeig in Meinem Bereich',
    type: 'checkbox',
    key: nameOf<Event>('showInMyArea'),
    value: this.#data?.showInMyArea ? 'checked' : 'unchecked',
    labelPosition: 'before',
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Event, VmValidFormTypes | boolean | EventMusicSheetTeaser[]>(
        this.#changedValues,
      );

      if (x === 'save') {
        patch.eventId = this.#data?.eventId ?? -1;
        await firstValueFrom(this.#eventService.change$(patch, patch.eventId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#eventService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes | boolean | EventMusicSheetTeaser[], key: string): void {
    this.#changedValues[key] = newValue;
  }

  #storeChangedSheetValues(): void {
    this.storeChangedValue(this.#changedSheetValues, nameOf<Event>('sheets'));

    const oldData = this.#data?.sheets ?? [];
    let newData = [...oldData];
    for (const changedSheetValue of this.#changedSheetValues) {
      if (changedSheetValue.deleted) {
        newData = newData.filter(
          (x) =>
            !(x.number === changedSheetValue.number && x.scoreId === changedSheetValue.scoreId),
        );
      } else {
        newData.push(changedSheetValue);
      }
    }

    this.eventMusicSheetsData$.next(newData);
  }

  #storeNewSheetValue(newValue: EventMusicSheetTeaser): void {
    const currentValues = this.eventMusicSheetsData$.getValue();
    if (currentValues.find((x) => x.number === newValue.number || x.scoreId === newValue.scoreId)) {
      this.#snackbarService.raiseError(
        'Die Nummer oder das Stück existiert bereits im Event.',
        2500,
      );
      return;
    }

    if (
      this.#changedSheetValues.find(
        (x) => (x.number === newValue.number || x.scoreId === newValue.scoreId) && x.deleted,
      )
    ) {
      this.#changedSheetValues = this.#changedSheetValues.filter(
        (x) => !((x.number === newValue.number || x.scoreId === newValue.scoreId) && x.deleted),
      );
    } else {
      this.#changedSheetValues.push({
        scoreId: newValue.scoreId,
        number: newValue.number,
      });
    }

    this.#storeChangedSheetValues();
  }

  #storeDeletedSheetValue(deletedValue: EventMusicSheetTeaser): void {
    if (
      this.#changedSheetValues.find(
        (x) => x.number === deletedValue.number && x.scoreId === deletedValue.scoreId,
      )
    ) {
      this.#changedSheetValues = this.#changedSheetValues.filter(
        (x) => !(x.number === deletedValue.number && x.scoreId === deletedValue.scoreId),
      );
    } else {
      deletedValue.deleted = true;
      this.#changedSheetValues.push(deletedValue);
    }
    this.#storeChangedSheetValues();
  }

  #getNextScoreNumber(): string {
    const currentValues = this.eventMusicSheetsData$.getValue();
    const numbers = currentValues
      .map((x) => Number.parseInt(String(x.number), 10))
      .filter((x) => !Number.isNaN(x));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return (maxNumber + 1).toString();
  }

  storeNewScoreChange(value: VmValidFormTypes): void {
    this.#musicSheetTeaser.scoreId = parseInt(value as string, 10);
  }

  execActionFromRow(event: VmRowClickedEvent<EventMusicSheetTeaser>): void {
    if (event.key === 'delete') {
      if (event.rowData === null) {
        return;
      }
      this.#storeDeletedSheetValue(event.rowData);
      return;
    }

    if (event.key === 'add' && this.#musicSheetTeaser.scoreId !== -1) {
      this.#storeNewSheetValue({
        scoreId: this.#musicSheetTeaser.scoreId,
        number: this.#getNextScoreNumber(),
      });
    }
  }
  storeBooleanChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.storeChangedValue(this.#checkboxToBool(newValue), key);
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }
}
