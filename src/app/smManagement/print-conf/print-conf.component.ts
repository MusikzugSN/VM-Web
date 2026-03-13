import { Component, inject } from '@angular/core';
import {
  VmcButtonToggle,
  VmcInputField,
  VmFormField,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { PrintconfService, Printconf, Mode, Duplex } from '@vm-utils/services';
import { Dictionary, nameOf } from '@vm-utils';
import { DIALOG_DATA } from '@vm-utils/dialogs';
import {  Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-print-conf',
  imports: [VmcInputField, VmcButtonToggle, AsyncPipe],
  templateUrl: './print-conf.component.html',
  styleUrl: './print-conf.component.scss',
})
export class PrintConfComponent {
  readonly printconfService = inject(PrintconfService);
  readonly #data = inject<Printconf | undefined>(DIALOG_DATA);
  printconfs$: Observable<Printconf[]> = this.printconfService.load$(); //todo: als obserable
  configNames: string[] = [];
  printconfs: Printconf[] = [];
  #changedValues: Dictionary<string> = {};
  selectedConfig?: Printconf; // todo: als behaviour subject

  selectConfig(conf: Printconf) {
    this.selectedConfig = { ...conf };
  }

  saveConfig() {
    if (!this.selectedConfig) return;

    this.printconfService.change$(this.selectedConfig, this.selectedConfig.printConfigId).subscribe(() => {
      this.loadConfigs();
      this.selectedConfig = undefined;
    });
  }

  selectoptions: VmSelectOption[] = [
    { label: 'Exact', value: '0' },
    { label: 'Über', value: '1' },
    { label: 'Unter', value: '2' },
  ];
  pageCountField: VmFormField = {
    type: 'text',
    key: nameOf<Printconf>('pageCount'),
    label: 'Seitenanzahl',
    required: true,
    value: this.#data?.pageCount ?? '',
  };
  duplexField: VmFormField = {
    type: 'select',
    label: 'Duplex',
    key: nameOf<Printconf>('duplex'),
    required: true,
    options: [
      { label: 'Nein', value: Duplex.No.toString() },
      { label: 'Lange Seite', value: Duplex.Long.toString() },
      { label: 'Kurze Seite', value: Duplex.Short.toString() },
    ],
  };
  fileFormatField: VmFormField = {
    type: 'select',
    label: 'Dateiformat',
    key: nameOf<Printconf>('fileformat'),
    required: true,
    options: [
      { label: 'A4', value: '4' },
      { label: 'A3', value: '3' },
    ],
  };

  getConfigForPage(pageCount: number, configs: Printconf[]): number | undefined {
    for (const conf of configs) {
      if (conf.mode === Mode.Over && pageCount >= conf.pageCount) {
        return conf.printConfigId;
      }
      if (conf.mode === Mode.Under && pageCount < conf.pageCount) {
        return conf.printConfigId;
      }
      if (conf.mode === Mode.Exact && pageCount === conf.pageCount) {
        return conf.printConfigId;
      }
    }
    return undefined;
  }

  formatToString(fileformat: number): string {
    return `A${fileformat}`;
  }

  loadConfigs() {
    this.printconfService.load$().subscribe((data: Printconf[]) => {
      this.printconfs = data;
      this.configNames = [];
      for (let i = 0; i < this.printconfs.length; i++) {
        this.configNames.push(this.printconfs[i]?.pageCount.toString() ?? '');
      }
    });
  }

  items: VmToolbarItem[] = [
    {
      key: 'addPreset',
      icon: 'add',
      label: 'Druckereinstellung hinzufügen',
      acton: async (): Promise<void> => {
        this.saveConfig()
      },
    },
  ];
  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.#changedValues[key] = newValue as string;
  }
}
