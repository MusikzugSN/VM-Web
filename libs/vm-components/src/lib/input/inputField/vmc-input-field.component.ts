import { Component, effect, input, InputSignal, output } from '@angular/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { VmValidFormTypes, VmFormField, VmCheckboxValues } from '../form.models';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { VmcSelect } from '../select/vmc-select.component';

@Component({
  selector: 'vmc-input-field',
  imports: [MatInput, MatLabel, MatFormField, FormsModule, MatCheckbox, VmcSelect],
  templateUrl: './vmc-input-field.component.html',
  styleUrl: './vmc-input-field.component.scss',
})
export class VmcInputField {
  formField: InputSignal<VmFormField> = input.required();
  shouldInitChange: InputSignal<boolean> = input(true);

  inputChanged = output<VmValidFormTypes | VmCheckboxValues>();

  constructor() {
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

  selectCallChangeEvent(event: string | string[]): void {
    this.inputChanged.emit(event);
  }

  genericCallChangeEvent(event: Event): void {
    this.inputChanged.emit((event.target as HTMLInputElement).value);
  }
}
