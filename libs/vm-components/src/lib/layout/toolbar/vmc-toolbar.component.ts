import {Component, input, InputSignal} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'vmc-toolbar',
  imports: [
    MatToolbar
  ],
  templateUrl: './vmc-toolbar.component.html',
  styleUrl: './vmc-toolbar.component.scss',
})
export class VmcToolbar {

  useNgContent: InputSignal<boolean> = input<boolean>(false);

}
