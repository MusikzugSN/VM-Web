import {ChangeDetectionStrategy, Component, input, InputSignal, output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Dictionary} from '@vm-utils';
import {FormsModule} from '@angular/forms';
import {VmForm} from './form.models';
import {VmcButton} from '../button/vmc-button.component';

@Component({
  selector: 'vmc-form',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    VmcButton
  ],
  templateUrl: './vmc-form.component.html',
  styleUrl: './vmc-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VmcForm {

  values: Dictionary<string> = {};
  formData: InputSignal<VmForm> = input.required();

  onSubmit = output<Dictionary<string>>()

  onChange(event: Event, key: string) {
    this.values[key] = (event.target as HTMLInputElement).value;
  }

  submitClicked() {
    this.onSubmit.emit(this.values);
  }

}
