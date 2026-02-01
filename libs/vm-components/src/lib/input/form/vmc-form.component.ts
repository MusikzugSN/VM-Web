import { ChangeDetectionStrategy, Component, input, InputSignal, output } from '@angular/core';
import { Dictionary } from '@vm-utils';
import { FormsModule } from '@angular/forms';
import { VmcValidFormTypes, VmForm } from '../form.models';
import { VmcButton } from '../button/vmc-button.component';
import { VmcInputField } from '../inputField/vmc-input-field.component';

@Component({
  selector: 'vmc-form',
  imports: [FormsModule, VmcButton, VmcInputField],
  templateUrl: './vmc-form.component.html',
  styleUrl: './vmc-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmcForm {
  values: Dictionary<VmcValidFormTypes> = {};
  formData: InputSignal<VmForm> = input.required();

  formSubmitted = output<Dictionary<VmcValidFormTypes>>();

  onChange(newValue: VmcValidFormTypes, key: string): void {
    this.values[key] = newValue;
  }

  submitClicked(): void {
    this.formSubmitted.emit(this.values);
  }
}
