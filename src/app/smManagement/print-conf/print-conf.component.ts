import { Component, inject } from '@angular/core';
import {
  VmcButtonToggle,
  VmcInputField, VmcToolbar, VmFormField,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { PrintconfService, Printconf,Duplex} from '@vm-utils/services';
import { convertToPatch, Dictionary, nameOf } from '@vm-utils';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  Observable, of,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-print-conf',
  imports: [VmcInputField, VmcButtonToggle, AsyncPipe, VmcToolbar],
  templateUrl: './print-conf.component.html',
  styleUrl: './print-conf.component.scss',
})
export class PrintConfComponent {
  readonly printconfService = inject(PrintconfService);
  // printconfs$: Observable<Printconf[]> = this.printconfService.load$();
   printconfs$: Observable<Printconf[]> = of([]);
  #changedValues: Dictionary<string> = {};
  #reload = new BehaviorSubject(false);

  selectedConfigId$ = new BehaviorSubject<number | undefined>(undefined);
  selectedConfig$ = combineLatest([this.printconfs$, this.selectedConfigId$]).pipe(
    map(([configs, selectedId]) => {
      if (selectedId === undefined) {
        return undefined;
      }
      return configs.find((c) => c.printConfigId == selectedId);
    }),
  );

  createConfigClicked() {
    this.selectedConfigId$.next(-1);
  }

  selectConfig(conf: Printconf) {
    this.selectedConfigId$.next(conf.printConfigId);
  }

  async saveConfig(): Promise<void> {
    const configId = this.selectedConfigId$.getValue();

    if (configId === undefined) {
      return;
    }

    if (configId === -1) {
      const createPatch = convertToPatch<Printconf, string>(this.#changedValues);
      await firstValueFrom(this.printconfService.create$(createPatch));
    } else {
      const patch = convertToPatch<Printconf, string>(this.#changedValues);
      patch.printConfigId = configId;

      await firstValueFrom(this.printconfService.change$(patch, configId));
    }

    this.#reload.next(true);
  }

  selectoptions: VmSelectOption[] = [
    { label: 'Genau', value: '0' },
    { label: 'Über', value: '1' },
    { label: 'Unter', value: '2' },
  ];

  pageCountField = this.selectedConfig$.pipe(
    map(
      (selectedConfig) =>
        ({
          type: 'text',
          key: nameOf<Printconf>('pageCount'),
          label: 'Seitenanzahl',
          required: true,
          value: selectedConfig?.pageCount ?? '',
        }) as VmFormField,
    ),
  );
  pageCountFieldPlaceholder: VmFormField = {
    key: nameOf<Printconf>('pageCount'),
    label: 'Seitenanzahl',
    type: 'text',
    required: true,
    value: '',
  };
  duplexField = this.selectedConfig$.pipe(
    map(
      (selectedConfig) =>
        ({
          type: 'select',
          label: 'Duplex',
          key: nameOf<Printconf>('duplex'),
          required: true,
          value: selectedConfig?.duplex ?? '',
          options: [
            { label: 'Nein', value: Duplex.No.toString() },
            { label: 'Lange Seite', value: Duplex.Long.toString() },
            { label: 'Kurze Seite', value: Duplex.Short.toString() },
          ],
        }) as VmFormField,
    ),
  );
  noDuplexOption: VmSelectOption = {
    label: 'Keine Duplex ausgewählt',
    value: '',
  };
  duplexFieldPlaceholder: VmFormField = {
    key: nameOf<Printconf>('duplex'),
    label: 'Duplex',
    type: 'select',
    required: true,
    value: '',
    options: [this.noDuplexOption],
  };
  fileFormatField = this.selectedConfig$.pipe(
    map(
      (selectedConfig) =>
        ({
          type: 'select',
          label: 'Dateiformat',
          key: nameOf<Printconf>('fileformat'),
          required: true,
          value: selectedConfig?.fileformat ?? '',
          options: [
            { label: 'A4', value: '4' },
            { label: 'A3', value: '3' },
          ],
        }) as VmFormField,
    ),
  );
  noFileformatOption: VmSelectOption = {
    label: 'Kein Dateiformat ausgewählt',
    value: '',
  };
  fileFormatFieldPlaceholder: VmFormField = {
    key: nameOf<Printconf>('fileformat'),
    label: 'Dateiformat',
    type: 'select',
    required: true,
    value: '',
    options: [this.noFileformatOption],
  };

  items: VmToolbarItem[] = [
    {
      key: 'addPreset',
      icon: 'add',
      label: 'Druckereinstellung hinzufügen',
      action: async (): Promise<void> => {
        await this.createConfigClicked();
      },
    },
  ];
  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue as string;
  }
}
