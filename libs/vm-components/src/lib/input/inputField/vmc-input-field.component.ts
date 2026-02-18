import { Component, effect, input, InputSignal, output } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { VmValidFormTypes, VmFormField } from '../form.models';
import { FormsModule } from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'vmc-input-field',
  imports: [MatInput, MatLabel, MatFormField, FormsModule, MatCheckbox, MatSelect, MatOption],
  templateUrl: './vmc-input-field.component.html',
  styleUrl: './vmc-input-field.component.scss',
})
export class VmcInputField {
  formField: InputSignal<VmFormField> = input.required();
  shouldInitChange: InputSignal<boolean> = input(true);

  inputChnaged = output<VmValidFormTypes>();

  constructor() {
    // Das ist nicht gut...
    // Ich mache das damit die values in vmc-form immer aktuell sind.
    effect(() => {
      const field = this.formField();
      if (field.type !== 'select') {
        if (field?.value && this.shouldInitChange()) {
          this.inputChnaged.emit(field.value);
        }
      }
    });
  }

  checkboxCallChangeEvent(checked: boolean): void {
    this.inputChnaged.emit(checked ? 'checked' : 'unchecked');
  }

  genericCallChangeEvent(event: Event): void {
    this.inputChnaged.emit((event.target as HTMLInputElement).value);
  }
}
