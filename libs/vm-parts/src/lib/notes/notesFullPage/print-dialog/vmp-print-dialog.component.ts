import {Component, inject} from '@angular/core';
import {PrintService} from './print.service';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase} from '@vm-utils/dialogs';
import { firstValueFrom, Observable} from 'rxjs';
import {VmcInputField, VmCheckboxValues, VmFormField, VmValidFormTypes} from '@vm-components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Dictionary } from '@vm-utils';

interface PrintDialogData {
  selectedIds?: number[];
}

@Component({
  selector: 'vmp-print-dialog',
  imports: [VmcInputField],
  templateUrl: './vmp-print-dialog.component.html',
  styleUrl: './vmp-print-dialog.component.scss',
})
export class VmpPrintDialog extends DialogBase<boolean> {
  readonly #data = inject<PrintDialogData | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #printService = inject(PrintService);

  #changedValues: Dictionary<boolean> = {};

  marschbuchField: VmFormField = {
    label: 'Marschbuch',
    type: 'checkbox',
    key: 'marschbuch',
    value: 'unchecked',
    labelPosition: 'before',
  };

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'print') {
        const selectedIds = this.#data?.selectedIds ?? [];
        if (selectedIds.length === 0) {
          super.closeDialog(false);
          return;
        }

        const marschbuch = this.#changedValues['marschbuch'] ?? false;
        const downloadUrl = await firstValueFrom(this.#printService.createPrintDownloadUrl$(selectedIds, marschbuch));
        const file = await firstValueFrom(this.#printService.downloadByUrl$(downloadUrl));

        this.#printPdf(file);
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeBooleanChangedValue(newValue: VmValidFormTypes | VmCheckboxValues, key: string): void {
    this.#changedValues[key] = this.#checkboxToBool(newValue);
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }

  #printPdf(file: Blob): void {
    const fileUrl = URL.createObjectURL(file);
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.src = fileUrl;

    frame.onload = (): void => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
        frame.remove();
      }, 1000);
    };

    document.body.appendChild(frame);
  }

}
