import {ChangeDetectionStrategy, Component, input, InputSignal, output} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Dictionary} from '@vm-utils';
import {FormsModule} from '@angular/forms';
import {VmForm} from './form.models';
import {Button} from '../button/button';

@Component({
  selector: 'vmc-form',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    Button
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Form {

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
