import { Component, effect, input, InputSignal, output } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import {VmValidFormTypes, VmFormField, VmCheckboxValues} from '../form.models';
import { FormsModule } from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'vmc-input-field',
  imports: [MatInput, MatLabel, MatFormField, FormsModule, MatCheckbox, MatSelect, MatOption],
  templateUrl: './vmc-input-field.component.html',
  styleUrl: './vmc-input-field.component.scss',
})
export class VmcInputField {
  formField: InputSignal<VmFormField> = input.required();
  shouldInitChange: InputSignal<boolean> = input(true);

  inputChanged = output<VmValidFormTypes | VmCheckboxValues>();

  constructor() {
    // Das ist nicht gut...
    // Ich mache das damit die values in vmc-form immer aktuell sind.
    effect(() => {
      const field = this.formField();
      if (field.type !== 'select') {
        if (field?.value && this.shouldInitChange()) {
          this.inputChanged.emit(field.value);
        }
      }
    });
  }

  checkboxCallChangeEvent(checked: boolean): void {
    this.inputChanged.emit(checked ? 'checked' : 'unchecked');
  }

  selectCallChangeEvent(event: MatSelectChange): void {
    this.inputChanged.emit(event.value);
  }

  genericCallChangeEvent(event: Event): void {
    this.inputChanged.emit((event.target as HTMLInputElement).value);
  }
}
