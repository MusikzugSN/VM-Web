import { Component, input, InputSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'vmc-icon',
  imports: [MatIcon],
  templateUrl: './vmc-icon.component.html',
  styleUrl: './vmc-icon.component.scss',
})
export class VmcIcon {
  iconName: InputSignal<string> = input.required();
  iconSize: InputSignal<string> = input('24px');
  iconColor: InputSignal<string> = input('black');
}
