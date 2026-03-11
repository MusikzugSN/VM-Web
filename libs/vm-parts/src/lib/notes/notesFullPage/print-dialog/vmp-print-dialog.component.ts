import {Component, inject} from '@angular/core';
import {PrintService} from './print.service';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';
import { map, Observable} from 'rxjs';
import {VmcInputField, VmFormField, VmSelect} from '@vm-components';
import {AsyncPipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
@Component({
  selector: 'vmp-print-dialog',
  imports: [
    VmcInputField,
    AsyncPipe
  ],
  templateUrl: './vmp-print-dialog.component.html',
  styleUrl: './vmp-print-dialog.component.scss',
})
export class VmpPrintDialog extends DialogBase<boolean> {
  readonly _data = inject<undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);


  readonly #printService = inject(PrintService);

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  printer$ = this.#printService.getPrinters$();
  selector$ = this.printer$.pipe(map(x => {
    return {
      key: 'printer',
      type: 'select',
      label: 'Drucker',
      options: x.map(printer => ({ value: printer.name, label: printer.name })),
      required: true,
    } as VmSelect;
  }));

  selectorPlaceholder: VmFormField = {
    type: 'select',
    key: 'printer',
    label: 'Drucker',
    options: [],
    required: true,
  };

}
