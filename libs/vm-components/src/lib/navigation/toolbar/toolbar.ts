import {Component, input, InputSignal} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';

export interface IToolbarItem {
  name: string;
  route: string;
  selected?: boolean;
}

@Component({
  selector: 'vmc-toolbar',
  imports: [
    MatToolbar,
    MatIcon
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  applicationName: InputSignal<string> = input.required();
  toolbarItems: InputSignal<IToolbarItem[]> = input.required();
}
