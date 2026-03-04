import { Component, inject, Injector, Type } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgComponentOutlet, AsyncPipe } from '@angular/common';
import { VmcButton, VmcIconButton, VmcToolbar } from '@vm-components';
import { BehaviorSubject } from 'rxjs';
import { DIALOG_BUTTON_CLICKS, DIALOG_BUTTONS$, DIALOG_DATA, VmDialogButtonConfig } from '@vm-utils';

export interface VmDialogConfig<TData> {
  title: string;
  content: Type<unknown>;
  data: TData;
  buttons?: VmDialogButtonConfig[];
}

@Component({
  selector: 'vmu-dialog-layout-component',
  imports: [
    MatDialogContent,
    NgComponentOutlet,
    MatDialogActions,
    VmcButton,
    VmcToolbar,
    VmcIconButton,
    AsyncPipe,
  ],
  templateUrl: './vmu-dialog-layout.component.html',
  styleUrl: './vmu-dialog-layout.component.scss',
})
export class VmuDialogLayoutComponent<TData> {
  readonly #injector = inject(Injector);
  readonly dialogRef = inject(MatDialogRef<VmuDialogLayoutComponent<TData>>);

  readonly dialogConfig: VmDialogConfig<TData> = inject<VmDialogConfig<TData>>(MAT_DIALOG_DATA);

  buttonClickEvents$ = new BehaviorSubject<string | undefined>(undefined);
  buttons$ = new BehaviorSubject<VmDialogButtonConfig[]>(this.dialogConfig.buttons ?? []);

  injectorForContent = Injector.create({
    providers: [
      { provide: DIALOG_DATA, useValue: this.dialogConfig.data },
      { provide: MatDialogRef, useValue: this.dialogRef },
      { provide: DIALOG_BUTTON_CLICKS, useValue: this.buttonClickEvents$.asObservable() },
      { provide: DIALOG_BUTTONS$, useValue: this.buttons$ },
    ],
    parent: this.#injector,
  });

  buttonClicked(key: string): void {
    this.buttonClickEvents$.next(key);
  }
}
