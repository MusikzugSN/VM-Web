import { Component, EventEmitter, Input, input, InputSignal, Output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VmSelectOption } from '@vm-components';
import { Mode } from '@vm-utils/services'
@Component({
  selector: 'vmc-button-toggle',
  imports: [MatButtonToggleModule],
  templateUrl: './vmc-button-toggle.component.html',
  styleUrl: './vmc-button-toggle.component.scss',
})
export class VmcButtonToggle {
  selectOptions: InputSignal<VmSelectOption[]> = input.required();

  @Input() value!: Mode;
  @Output() buttonClicked = new EventEmitter<Mode>();
}
