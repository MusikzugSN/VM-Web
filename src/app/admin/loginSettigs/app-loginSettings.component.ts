import { Component } from '@angular/core';
import {VmcInputField, VmcSelect, VmcToolbar} from '@vm-components';

@Component({
  selector: 'app-general',
  imports: [VmcToolbar, VmcInputField, VmcSelect],
  templateUrl: './app-loginSettings.component.html',
  styleUrl: './app-loginSettings.component.scss',
})
/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export class AppLoginSettings {}
