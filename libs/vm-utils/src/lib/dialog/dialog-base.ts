import { MatDialogRef} from '@angular/material/dialog';
import {inject} from '@angular/core';

export class DialogBase<TResult = any> {

  readonly #dialogRef: MatDialogRef<DialogBase<TResult>> = inject(MatDialogRef);

  closeDialog(result?: TResult): void {
    this.#dialogRef.close(result);
  }
}
