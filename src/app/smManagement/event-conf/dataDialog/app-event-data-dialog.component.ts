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
  EventScoreTeaser,
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

  readonly #initialScores: EventScoreTeaser[] = this.#data?.scores ?? [];

  // Datenquelle fuer die Event-Scores
  eventMusicSheetsData$: BehaviorSubject<EventScoreTeaser[]> = new BehaviorSubject<
    EventScoreTeaser[]
  >(this.#initialScores);

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
  ScoreType: EventScoreTeaser;

  #changedValues: Dictionary<VmValidFormTypes | boolean | EventScoreTeaser[]> = {};
  #changedScoreValues: EventScoreTeaser[] = [];

  #selectedScoreId = -1;

  private toDateInputValue(value?: string): string {
    const v = value ?? '';
    const idx = v.indexOf('T');
    return idx >= 0 ? v.substring(0, idx) : v;
  }

  eventNameField: VmFormField = {
    type: 'text',
    key: nameOf<Event>('name'),
    label: 'Eventname',
    required: true,
    value: this.#data?.name ?? '',
    placeholder: 'z. B. Die Schlager Camper',
    maxLength: 24,
  };

  eventDateField: VmFormField = {
    type: 'date',
    key: nameOf<Event>('date'),
    label: 'Datum',
    required: true,
    value: this.toDateInputValue(this.#data?.date),
  };

  groupSelectorField$: Observable<VmFormField> = this.groupsdata$.pipe(
    distinctUntilChanged(),
    map((groups) => {
      return {
        label: 'Gruppe',
        type: 'select',
        key: nameOf<Event>('groupId'),
        value: this.#data?.groupId?.toString() ?? '',
        options: [...groups.map((x) => ({ label: x.name, value: x.groupId + '' }))],
        required: true,
      } as VmFormField;
    }),
    takeUntilDestroyed(),
  );

  // dateSelectorFieldPlaceholder: VmFormField = {
  //   key: nameOf<Date>('date'),
  //   label: 'Datum',
  //   type: 'date',
  //   options: []
  // };

  groupSelectorFieldPlaceholder: VmFormField = {
    key: nameOf<Group>('name'),
    label: 'Gruppe',
    type: 'select',
    options: [],
  };

  eventScoreColumns: VmColumn<EventScoreTeaser>[] = [
    {
      key: 'score',
      header: 'Stück',
      field: nameOf<EventScoreTeaser>('scoreId'),
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
      const patch = convertToPatch<Event, VmValidFormTypes | boolean | EventScoreTeaser[]>(
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

  storeChangedValue(newValue: VmValidFormTypes | boolean | EventScoreTeaser[], key: string): void {
    this.#changedValues[key] = newValue;
  }

  #storeChangedScoreValues(): void {
    this.storeChangedValue(this.#changedScoreValues, nameOf<Event>('scores'));

    const oldData = this.#initialScores;
    let newData = [...oldData];
    for (const changedScoreValue of this.#changedScoreValues) {
      if (changedScoreValue.deleted) {
        newData = newData.filter((x) => x.scoreId !== changedScoreValue.scoreId);
      } else {
        newData.push(changedScoreValue);
      }
    }

    this.eventMusicSheetsData$.next(newData);
  }

  #storeNewScoreValue(newValue: EventScoreTeaser): void {
    const currentValues = this.eventMusicSheetsData$.getValue();
    if (currentValues.find((x) => x.scoreId === newValue.scoreId)) {
      this.#snackbarService.raiseError('Das Stück existiert bereits im Event.', 2500);
      return;
    }

    if (this.#changedScoreValues.find((x) => x.scoreId === newValue.scoreId && x.deleted)) {
      this.#changedScoreValues = this.#changedScoreValues.filter(
        (x) => !(x.scoreId === newValue.scoreId && x.deleted),
      );
    } else {
      this.#changedScoreValues.push({
        scoreId: newValue.scoreId,
      });
    }

    this.#storeChangedScoreValues();
  }

  #storeDeletedScoreValue(deletedValue: EventScoreTeaser): void {
    if (this.#changedScoreValues.find((x) => x.scoreId === deletedValue.scoreId)) {
      this.#changedScoreValues = this.#changedScoreValues.filter(
        (x) => x.scoreId !== deletedValue.scoreId,
      );
    } else {
      deletedValue.deleted = true;
      this.#changedScoreValues.push(deletedValue);
    }
    this.#storeChangedScoreValues();
  }

  storeNewScoreChange(value: VmValidFormTypes): void {
    this.#selectedScoreId = parseInt(value as string, 10);
  }

  execActionFromRow(event: VmRowClickedEvent<EventScoreTeaser>): void {
    if (event.key === 'delete') {
      if (event.rowData === null) {
        return;
      }
      this.#storeDeletedScoreValue(event.rowData);
      return;
    }

    if (event.key === 'add' && this.#selectedScoreId !== -1) {
      this.#storeNewScoreValue({
        scoreId: this.#selectedScoreId,
      });
      this.#selectedScoreId = -1;
    }
  }
  storeBooleanChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.storeChangedValue(this.#checkboxToBool(newValue), key);
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }
}
