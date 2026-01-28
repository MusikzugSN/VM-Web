import {inject, Injectable, InjectionToken, Type} from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {VmuDialogLayoutComponent} from './dialogLayoutComponent/vmu-dialog-layout.component';
import {firstValueFrom} from 'rxjs';
import {DialogBase} from './dialog-base';
import {VmcButtonType} from '@vm-components';

export interface IDialogButtonConfig {
  type?: VmcButtonType;
  text: string;
  key: string;
}

export const DIALOG_DATA = new InjectionToken('dialogData');
export const DIALOG_BUTTON_CLICKS = new InjectionToken('buttonClickEvents$');

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
  open<TResult = any, TData = any,
    TComponent extends DialogBase<TResult> = DialogBase<TResult>>(
    contentComponent: Type<TComponent>,
    options?: {
      title?: string;
      data?: TData;
      buttons?: IDialogButtonConfig[];
      dialogConfig?: MatDialogConfig;
    }
  ): Promise<TResult | undefined> {
    const dialogRef = this.#dialog.open(VmuDialogLayoutComponent<TData>, {
      ...options?.dialogConfig,
      data: {
        title: options?.title ?? '',
        content: contentComponent,
        data: options?.data,
        buttons: options?.buttons ?? [{
          key: 'close',
          text: 'Schließen',
          type: 'filled'
        }]
      }
    });

    return firstValueFrom(dialogRef.afterClosed());
  }
}
