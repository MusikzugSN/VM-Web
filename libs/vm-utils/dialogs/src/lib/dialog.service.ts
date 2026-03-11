import { inject, Injectable, InjectionToken, Type } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VmuDialogLayoutComponent } from './dialogLayoutComponent/vmu-dialog-layout.component';
import { firstValueFrom } from 'rxjs';
import { DialogBase } from './dialog-base';
import { VmButtonColor, VmButtonType } from '@vm-components';

export interface VmDialogButtonConfig {
  type?: VmButtonType;
  color?: VmButtonColor;
  text: string;
  key: string;
}

export const DIALOG_DATA = new InjectionToken('dialogData');
export const DIALOG_BUTTON_CLICKS = new InjectionToken('buttonClickEvents$');
export const DIALOG_BUTTONS$ = new InjectionToken('dialogButtons$');

@Injectable({ providedIn: 'root' })
export class VmDialogService {
  readonly #dialog = inject(MatDialog);

  /*
   * opens an dialog with the given component as content
   * @param contentComponent the component to be rendered inside the dialog
   * @param options optional parameters for the dialog
   * @returns a promise that resolves when the dialog is closed
   *           => undefined if the dialog was closed without a result
   * */
  open<
    TResult = unknown,
    TData = unknown,
    TComponent extends DialogBase<TResult> = DialogBase<TResult>,
  >(
    contentComponent: Type<TComponent>,
    options?: {
      title?: string;
      data?: TData | undefined;
      buttons?: VmDialogButtonConfig[];
      dialogConfig?: MatDialogConfig;
    },
  ): Promise<TResult | undefined> {
    const dialogRef = this.#dialog.open(VmuDialogLayoutComponent<TData>, {
      ...options?.dialogConfig,
      data: {
        title: options?.title ?? '',
        content: contentComponent,
        data: options?.data,
        buttons: options?.buttons ?? [
          {
            key: 'close',
            text: 'Schließen',
            type: 'filled',
          },
        ],
      },
    });

    return firstValueFrom(dialogRef.afterClosed());
  }
}
