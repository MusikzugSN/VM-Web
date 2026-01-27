import {Component, input, InputSignal, output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {VmcIcon} from '@vm-components';

@Component({
  selector: 'vmc-icon-button',
  imports: [
    MatIconButton,
    VmcIcon
  ],
  templateUrl: './vmc-icon-button.component.html',
  styleUrl: './vmc-icon-button.component.scss',
})
export class VmcIconButton {
  iconName: InputSignal<string> = input.required();
  iconSize: InputSignal<string> = input('24px');
  disabled: InputSignal<boolean> = input(false);

  onClick = output();
}
