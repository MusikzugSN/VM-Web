import { Component, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { VmcIcon, VmcIconButton } from '@vm-components';
import { VmSnackbarData } from '@vm-utils';
import { Dictionary } from '@vm-utils';

@Component({
  selector: 'vmu-snackbar-layout',
  imports: [MatSnackBarLabel, MatSnackBarActions, VmcIconButton, VmcIcon],
  templateUrl: './vmu-snackbar-layout.component.html',
  styleUrl: './vmu-snackbar-layout.component.scss',
})
export class VmuSnackbarLayout {
  snackBarRef = inject(MatSnackBarRef);
  readonly dialogData = inject<VmSnackbarData>(MAT_SNACK_BAR_DATA);

  typeToColorMap: Dictionary<string> = {
    success: 'green',
    error: 'red',
    info: 'blue',
    warning: 'orange',
  };

  typeToIconMap: Dictionary<string> = {
    success: 'check_circle',
    error: 'cancel',
    info: 'info',
    warning: 'warning',
  };
}
