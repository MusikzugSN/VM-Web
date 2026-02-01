import { Component, input, InputSignal } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { VmcIcon } from '../../essentials/icon/vmc-icon.component';

export interface IToolbarItem {
  key: string;
  icon: string;
  label: string;
  acton: () => void;
}

@Component({
  selector: 'vmc-toolbar',
  imports: [MatToolbar, VmcIcon],
  templateUrl: './vmc-toolbar.component.html',
  styleUrl: './vmc-toolbar.component.scss',
})
export class VmcToolbar {
  useNgContent: InputSignal<boolean> = input<boolean>(false);
  items: InputSignal<IToolbarItem[]> = input<IToolbarItem[]>([]);
}
