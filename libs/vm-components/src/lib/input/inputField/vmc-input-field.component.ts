import {Component, effect, input, InputSignal, output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {VmFormField} from '../form.models';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'vmc-input-field',
  imports: [
    MatInput,
    MatLabel,
    MatFormField,
    FormsModule
  ],
  templateUrl: './vmc-input-field.component.html',
  styleUrl: './vmc-input-field.component.scss',
})
export class VmcInputField {
  formField: InputSignal<VmFormField> = input.required();

  onChange = output<string>()

  constructor() {
    // Das ist nicht gut...
    // Ich mache das damit die values in vmc-form immer aktuell sind.
    effect(() => {
      const field = this.formField();
      if (field?.value) {
        this.onChange.emit(field.value);
      }
    });
  }

  callChangeEvent(event: Event) {
    this.onChange.emit((event.target as HTMLInputElement).value);
  }
}
