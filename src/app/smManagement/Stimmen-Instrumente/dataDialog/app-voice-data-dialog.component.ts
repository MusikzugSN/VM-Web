import { Component, inject } from '@angular/core';
import { AsPipe, convertToPatch, Dictionary, nameOf } from '@vm-utils';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { Voice, VoiceService } from '@vm-utils/services';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';

interface VoiceAlternativeRow {
  alternative: number;
}

interface UpdateAlternateVoiceRequest {
  alternative: number;
  priority: number;
  deleted?: boolean;
}

interface VoicePatch extends Partial<Voice> {
  alternateVoices?: UpdateAlternateVoiceRequest[];
}

export interface VoiceDialogData {
  voice?: Voice;
  instrumentOptions: VmSelectOption[];
  alternativeVoiceOptions: VmSelectOption[];
}

@Component({
  selector: 'app-voice-data-dialog',
  imports: [VmcInputField, VmcDataGrid, AsyncPipe, AsPipe],
  templateUrl: './app-voice-data-dialog.component.html',
  styleUrl: './app-voice-data-dialog.component.scss',
})
export class AppVoiceDataDialog extends DialogBase<boolean> {
  readonly #data = inject<VoiceDialogData | undefined>(DIALOG_DATA);
  readonly #voiceService = inject(VoiceService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #initialAlternativeVoiceIds = this.#data?.voice?.alternateVoiceIds ?? [];
  readonly #alternativeVoiceLabelById = new Map<number, string>(
    (this.#data?.alternativeVoiceOptions ?? []).map((x) => [Number(x.value), x.label]),
  );

  readonly #alternativeVoicesData$ = new BehaviorSubject<VoiceAlternativeRow[]>(
    this.#initialAlternativeVoiceIds.map((id) => ({ alternative: id })),
  );

  readonly alternativeVoicesData$ = this.#alternativeVoicesData$.asObservable();

  readonly #alternativeVoiceOptions$ = this.#alternativeVoicesData$.pipe(
    map((rows) => {
      const selected = rows.map((x) => x.alternative);
      return (this.#data?.alternativeVoiceOptions ?? []).filter(
        (option) => !selected.includes(Number(option.value)),
      );
    }),
  );

  readonly alternativeVoiceOptions = toSignal<VmSelectOption[], VmSelectOption[]>(
    this.#alternativeVoiceOptions$,
    { initialValue: [] },
  );

  // @ts-expect-error
  VoiceAlternativeType: VoiceAlternativeRow;

  #changedValues: Dictionary<VmValidFormTypes | UpdateAlternateVoiceRequest[]> = {};
  #selectedAlternativeVoiceId = -1;

  nameField: VmFormField = {
    label: 'Nummer der Stimme',
    type: 'text',
    key: nameOf<Voice>('name'),
    value: this.#data?.voice?.name ?? '',
    placeholder: 'z. B. 1',
    maxLength: 4,
  };

  instrumentField: VmFormField = {
    label: 'Instrument',
    type: 'select',
    enableSearch: true,
    key: nameOf<Voice>('instrumentId'),
    value: this.#data?.voice?.instrumentId?.toString() ?? '',
    options: this.#data?.instrumentOptions ?? [],
  };

  alternativeVoiceColumns: VmColumn<VoiceAlternativeRow>[] = [
    {
      key: 'alternativeVoice',
      header: 'Alternative Stimme',
      field: nameOf<VoiceAlternativeRow>('alternative'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  alternativeVoiceActions: VmRowAction[] = [{ key: 'delete', icon: 'delete' }];

  alternativeVoiceFooterActions: VmRowAction[] = [{ key: 'add', icon: 'add' }];

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<VoicePatch, VmValidFormTypes | UpdateAlternateVoiceRequest[]>(
        this.#changedValues,
      );

      if (patch.instrumentId !== undefined) {
        patch.instrumentId = Number(patch.instrumentId) as never;
      }

      if (x === 'save') {
        patch.voiceId = this.#data?.voice?.voiceId ?? -1;
        await firstValueFrom(this.#voiceService.change$(patch, patch.voiceId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#voiceService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue;
  }

  storeNewAlternativeVoiceChange(value: VmValidFormTypes): void {
    this.#selectedAlternativeVoiceId = Number(value);
  }

  execAlternativeVoiceAction(event: VmRowClickedEvent<VoiceAlternativeRow>): void {
    if (event.key === 'delete' && event.rowData !== null) {
      const rowData = event.rowData;
      this.#alternativeVoicesData$.next(
        this.#alternativeVoicesData$
          .getValue()
          .filter((x) => x.alternative !== rowData.alternative),
      );
      this.#storeChangedAlternativeValues();
      return;
    }

    if (event.key === 'add' && this.#selectedAlternativeVoiceId !== -1) {
      const currentValues = this.#alternativeVoicesData$.getValue();
      if (!currentValues.some((x) => x.alternative === this.#selectedAlternativeVoiceId)) {
        this.#alternativeVoicesData$.next([
          ...currentValues,
          { alternative: this.#selectedAlternativeVoiceId },
        ]);
      }
      this.#storeChangedAlternativeValues();
      this.#selectedAlternativeVoiceId = -1;
    }
  }

  resolveAlternativeVoiceName(alternativeVoiceId: number): string {
    return this.#alternativeVoiceLabelById.get(alternativeVoiceId) ?? 'N/A';
  }

  #buildAlternateVoicePatch(): UpdateAlternateVoiceRequest[] {
    const currentAlternativeIds = this.#alternativeVoicesData$.getValue().map((x) => x.alternative);

    const activeAlternatives = currentAlternativeIds.map((alternativeVoiceId, index) => ({
      alternative: alternativeVoiceId,
      priority: index + 1,
    }));

    if (!this.#data?.voice) {
      return activeAlternatives;
    }

    const deletedAlternatives = this.#initialAlternativeVoiceIds
      .filter((alternativeVoiceId) => !currentAlternativeIds.includes(alternativeVoiceId))
      .map((alternativeVoiceId) => ({
        alternative: alternativeVoiceId,
        priority: 0,
        deleted: true,
      }));

    return [...activeAlternatives, ...deletedAlternatives];
  }

  #storeChangedAlternativeValues(): void {
    this.#changedValues[nameOf<VoicePatch>('alternateVoices')] = this.#buildAlternateVoicePatch();
  }
}
