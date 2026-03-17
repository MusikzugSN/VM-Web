import { Component, input, InputSignal, output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VmSelectOption } from '@vm-components';

@Component({
  selector: 'vmc-button-toggle',
  imports: [MatButtonToggleModule],
  templateUrl: './vmc-button-toggle.component.html',
  styleUrl: './vmc-button-toggle.component.scss',
})
export class VmcButtonToggle {
  selectOptions: InputSignal<VmSelectOption[]> = input.required();

  value: InputSignal<string | undefined> = input<string | undefined>(undefined);
  buttonClicked = output<string>();
}
