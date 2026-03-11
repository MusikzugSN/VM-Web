import { Component, inject } from '@angular/core';
import { VmcInputField, VmFormField, VmSelectOption, VmValidFormTypes } from '@vm-components';
import {
  convertToPatch,
  Dictionary,
  nameOf,
  NumDictionary,
} from '@vm-utils';
import { Event, EventService } from '@vm-utils/services';
import { distinctUntilChanged, firstValueFrom, map, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Group, GroupService } from '@vm-utils/services';
import { AsyncPipe } from '@angular/common';
import {DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';

const noGroupOption: VmSelectOption = {
  label: 'Keine Gruppe',
  value: '',
};

@Component({
  selector: 'app-event-data-dialog.component',
  imports: [VmcInputField, AsyncPipe],
  templateUrl: './app-event-data-dialog.component.html',
  styleUrl: './app-event-data-dialog.component.scss',
})
export class AppEventDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Event | undefined>(DIALOG_DATA);
  readonly #groupService = inject(GroupService);
  readonly #eventService = inject(EventService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  groupsdata$: Observable<Group[]> = this.#groupService.load$();

  #groupOptions$: Observable<VmSelectOption[]> = this.groupsdata$.pipe(
    map((x) => x.map((group) => ({ label: group.name, value: group.groupId.toString() }))),
  );

  groupOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#groupOptions$, {
    initialValue: [],
  });

  #groupsById$: Observable<NumDictionary<Group>> = this.groupsdata$.pipe(
    map((x) =>
      x.reduce((acc, group) => ({ ...acc, [group.groupId]: group }), {} as NumDictionary<Group>),
    ),
  );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>>(this.#groupsById$, {
    initialValue: {},
  });

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
    options: [noGroupOption],
  };
  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Event, string>(this.changedValues);
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

  changedValues: Dictionary<string> = {};

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.changedValues[key] = newValue as string;
  }
}
