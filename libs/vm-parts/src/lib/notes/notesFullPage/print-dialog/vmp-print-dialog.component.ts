import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { Printer, VmpPrintService } from './vmp-print.service';
import {VmcInputField, VmFormField} from '@vm-components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  convertToPatch,
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
} from '@vm-utils';
import {map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'vmp-print-dialog.component',
  imports: [VmcInputField, AsyncPipe],
  templateUrl: './vmp-print-dialog.component.html',
  styleUrl: './vmp-print-dialog.component.scss',
})
export class PrintDialog extends DialogBase<boolean> {
  readonly #data = inject<Printer | undefined>(DIALOG_DATA);
  #printService = inject(VmpPrintService);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  filestoPrint = input.required<{ url: string; filename: string }[]>();
  @Output() dialogClose = new EventEmitter<void>();

  printers$ = this.#printService.getPrinters();

  selectedPrinterName = '';

  printerSelectorField: Observable<VmFormField> = this.printers$.pipe(
    map((printers) => {
      return {
        key: 'printerSelect',
        type: 'select',
        label: 'Drucker auswählen',
        options: printers.map((p) => ({
          value: p.name,
          label: p.name,
        })),
      };
    }),
  );
  printersSelectorPlaceholder: VmFormField = {
    key: 'printerSelect',
    type: 'select',
    label: 'Drucker auswählen',
    options: [],
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Printer, string>(this.changedValues);
      if (x === 'save') {
        patch.printerId = this.#data?.printerId ?? -1;
        // await firstValueFrom(this.#printService.change$(patch, patch.printerId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        // await firstValueFrom(this.#printService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
  changedValues: Dictionary<string> = {};

  storePrinterChange(event: string | number) {
    this.selectedPrinterName = event.toString();
  }

  onPrint() {
    if (this.selectedPrinterName) {
      this.#printService
        .printFiles(this.selectedPrinterName, this.filestoPrint())
        .subscribe(() => this.dialogClose.emit());
    }
  }
}


