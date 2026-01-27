import {Component, input, InputSignal, output} from '@angular/core';
import {MatButton} from '@angular/material/button';

export type VmcButtonType = 'elevated' | 'filled' | 'tonal';

@Component({
  selector: 'vmc-button',
  imports: [
    MatButton
  ],
  templateUrl: './vmc-button.component.html',
  styleUrl: './vmc-button.component.scss',
})
export class VmcButton {

  label: InputSignal<string> = input.required<string>();
  type: InputSignal<VmcButtonType> = input<VmcButtonType>('elevated');
  disabled: InputSignal<boolean> = input<boolean>(false);

  onClick = output<void>();

}
