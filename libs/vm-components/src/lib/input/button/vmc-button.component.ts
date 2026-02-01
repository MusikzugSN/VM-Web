import {Component, computed, input, InputSignal, output} from '@angular/core';
import {MatButton} from '@angular/material/button';

export type VmcButtonType = 'elevated' | 'filled' | 'tonal';
export type VmcButtonColor = 'primary' | 'error';

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

  colorType: InputSignal<VmcButtonColor> = input<VmcButtonColor>('primary');
  colorClass = computed(() => this.#mapColorTypeToClass(this.colorType()));

  buttonClicked = output<boolean>();

  #mapColorTypeToClass(colorType: VmcButtonColor): string {
    switch (colorType) {
      case 'error':
        return 'vmc-button-error';
      default:
        return '';
    }
  }
}
