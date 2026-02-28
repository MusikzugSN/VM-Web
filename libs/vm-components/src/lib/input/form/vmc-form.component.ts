import { ChangeDetectionStrategy, Component, input, InputSignal, output } from '@angular/core';
import { Dictionary } from '@vm-utils';
import { FormsModule } from '@angular/forms';
import { VmValidFormTypes, VmForm } from '../form.models';
import { VmcButton } from '../button/vmc-button.component';
import { VmcInputField } from '../inputField/vmc-input-field.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'vmc-form',
  imports: [FormsModule, VmcButton, VmcInputField, NgStyle],
  templateUrl: './vmc-form.component.html',
  styleUrl: './vmc-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmcForm {
  values: Dictionary<VmValidFormTypes> = {};
  formData: InputSignal<VmForm> = input.required();

  formSubmitted = output<Dictionary<VmValidFormTypes>>();

  onChange(newValue: VmValidFormTypes, key: string): void {
    this.values[key] = newValue;
  }

  submitClicked(): void {
    this.formSubmitted.emit(this.values);
  }
}
