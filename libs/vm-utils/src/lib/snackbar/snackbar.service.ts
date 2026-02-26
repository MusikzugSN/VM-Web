import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {VmuSnackbarLayout} from './snackbarLayout/vmu-snackbar-layout.component';

export interface VmSnackbarData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  readonly #matSnackbar = inject(MatSnackBar);

  raiseSuccess(message: string, duration: number | undefined = 3000): void {
    this.#matSnackbar.openFromComponent<VmuSnackbarLayout, VmSnackbarData>(VmuSnackbarLayout, {
      duration,
      data: {
        message: message,
        type: 'success',
      }
    });
  }

  raiseError(message: string, duration: number | undefined = undefined): void {
    this.#matSnackbar.openFromComponent<VmuSnackbarLayout, VmSnackbarData>(VmuSnackbarLayout, {
      duration,
      data: {
        message: message,
        type: 'error',
      }
    });
  }

  raiseWarning(message: string, duration: number | undefined = 5000): void {
    this.#matSnackbar.openFromComponent<VmuSnackbarLayout, VmSnackbarData>(VmuSnackbarLayout, {
      duration,
      data: {
        message: message,
        type: 'warning',
      }
    });
  }

  raiseInfo(message: string, duration: number | undefined = 3000): void {
    this.#matSnackbar.openFromComponent<VmuSnackbarLayout, VmSnackbarData>(VmuSnackbarLayout, {
      duration,
      data: {
        message: message,
        type: 'info',
      }
    });
  }
}
