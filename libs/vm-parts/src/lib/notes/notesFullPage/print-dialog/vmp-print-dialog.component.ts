import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmcInputField, VmCheckboxValues, VmFormField, VmValidFormTypes } from '@vm-components';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { ConfigService, Dictionary } from '@vm-utils';
import { firstValueFrom, map, Observable} from 'rxjs';
import { PrintService } from './print.service';

interface PrintDialogData {
  selectedIds?: number[];
}

@Component({
  selector: 'vmp-print-dialog',
  imports: [VmcInputField, AsyncPipe],
  templateUrl: './vmp-print-dialog.component.html',
  styleUrl: './vmp-print-dialog.component.scss',
})
export class VmpPrintDialog extends DialogBase<boolean> {
  readonly #data = inject<PrintDialogData | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #printService = inject(PrintService);
  readonly #config = inject(ConfigService);

  filesCount = this.#data?.selectedIds?.length ?? 0;

  #changedValues: Dictionary<boolean> = {};
  selectedPrinterName = '';

  marschbuchField: VmFormField = {
    label: 'Marschbuch',
    type: 'checkbox',
    key: 'marschbuch',
    value: 'unchecked',
    labelPosition: 'before',
  };

  printer$ = this.#printService.getPrinters$();

  selector$ = this.printer$.pipe(
    map((printers) => {
      const defaultPrinter = printers.find((p) => p.is_default)?.name ?? printers[0]?.name ?? '';
      if (!this.selectedPrinterName && defaultPrinter) {
        this.selectedPrinterName = defaultPrinter;
      }

      return {
        key: 'printer',
        type: 'select',
        label: 'Drucker',
        options: printers.map((printer) => ({ value: printer.name, label: printer.name })),
        value: this.selectedPrinterName || defaultPrinter || '',
        required: true,
      } as VmFormField;
    }),
  );

  selectorPlaceholder: VmFormField = {
    type: 'select',
    key: 'printer',
    label: 'Drucker',
    options: [],
    required: true,
    value: '',
  };

  constructor() {
    super();

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'print') {
        const files = this.#data?.selectedIds ?? [];

        const selectedIds = this.#data?.selectedIds ?? [];
        if (selectedIds.length === 0) {
          super.closeDialog(false);
          return;
        }

        const marschbuch = this.#changedValues['marschbuch'] ?? false;

        const downloadUrl = await firstValueFrom(
          this.#printService.createPrintUrl$(selectedIds, marschbuch),
        );

        if (files.length > 0) {
          if (!this.selectedPrinterName) {
            super.closeDialog(false);
            return;
          }

          const config = await firstValueFrom(this.#config.config$);
          const filePath = await firstValueFrom(this.#printService.createPrintUrl$(files))

          await firstValueFrom(this.#printService.printFiles$(this.selectedPrinterName, [{
            url: config?.backedApiUrl + filePath,
            filename: `druckauftrag_${Date.now()}.pdf`
          }]));
          super.closeDialog(true);
          return;
        }

        const file = await firstValueFrom(this.#printService.downloadByToken$(downloadUrl));

        await this.#printPdf(file);
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

  storePrinterChange(event: string | number): void {
    this.selectedPrinterName = event.toString();
  }

  #checkboxToBool(value: VmValidFormTypes | VmCheckboxValues): boolean {
    return value === 'checked';
  }

  async #printPdf(file: string): Promise<void> {
    const config = await firstValueFrom(this.#config.config$);
    const fileUrl = config?.backedApiUrl + file;
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
