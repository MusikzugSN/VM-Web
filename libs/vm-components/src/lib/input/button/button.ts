import {Component, input, InputSignal, output} from '@angular/core';
import {MatButton} from '@angular/material/button';

type VmcButtonType = 'elevated' | 'filled' | 'tonal';

@Component({
  selector: 'vmc-button',
  imports: [
    MatButton
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

  label: InputSignal<string> = input.required<string>();
  type: InputSignal<VmcButtonType> = input<VmcButtonType>('elevated');
  disabled: InputSignal<boolean> = input<boolean>(false);

  onClick = output<void>();

}
