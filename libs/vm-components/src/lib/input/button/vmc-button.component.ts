import { Component, computed, input, InputSignal, output } from '@angular/core';
import { MatButton } from '@angular/material/button';

export type VmButtonType = 'elevated' | 'filled' | 'tonal';
export type VmButtonColor = 'primary' | 'error';

@Component({
  selector: 'vmc-button',
  imports: [MatButton],
  templateUrl: './vmc-button.component.html',
  styleUrl: './vmc-button.component.scss',
})
export class VmcButton {
  label: InputSignal<string> = input.required<string>();
  type: InputSignal<VmButtonType> = input<VmButtonType>('elevated');
  disabled: InputSignal<boolean> = input<boolean>(false);

  colorType: InputSignal<VmButtonColor> = input<VmButtonColor>('primary');
  colorClass = computed(() => this.#mapColorTypeToClass(this.colorType()));

  buttonClicked = output<boolean>();

  #mapColorTypeToClass(colorType: VmButtonColor): string {
    switch (colorType) {
      case 'error':
        return 'vmc-button-error';
      default:
        return '';
    }
  }
}
