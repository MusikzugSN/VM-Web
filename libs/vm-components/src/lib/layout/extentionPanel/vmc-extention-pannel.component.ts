import { Component, input, InputSignal } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';

@Component({
  selector: 'vmc-extention-pannel',
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
  ],
  templateUrl: './vmc-extention-pannel.component.html',
  styleUrl: './vmc-extention-pannel.component.scss',
})
export class VmcExtentionPannel {
  hideToggle: InputSignal<boolean> = input(false);
  extensionTitle: InputSignal<string> = input.required();
  expanded: InputSignal<boolean> = input(true);
}
