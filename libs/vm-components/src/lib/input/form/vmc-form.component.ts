import {ChangeDetectionStrategy, Component, input, InputSignal, output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Dictionary} from '@vm-utils';
import {FormsModule} from '@angular/forms';
import {VmForm} from '../form.models';
import {VmcButton} from '../button/vmc-button.component';
import {VmcInputField} from '../inputField/vmc-input-field.component';

@Component({
  selector: 'vmc-form',
  imports: [
    FormsModule,
    VmcButton,
    VmcInputField
  ],
  templateUrl: './vmc-form.component.html',
  styleUrl: './vmc-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmcForm {

  values: Dictionary<string> = {};
  formData: InputSignal<VmForm> = input.required();

  onSubmit = output<Dictionary<string>>()

  onChange(newValue: string, key: string) {
    this.values[key] = newValue;
  }

  submitClicked() {
    this.onSubmit.emit(this.values);
  }

}
