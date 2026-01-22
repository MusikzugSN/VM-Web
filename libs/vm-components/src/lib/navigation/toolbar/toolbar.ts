import {Component, inject, input, InputSignal} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';

export interface IToolbarItem {
  name: string;
  route: string;
  selected?: boolean;
}

@Component({
  selector: 'vmc-toolbar',
  imports: [
    MatToolbar
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  readonly #router = inject(Router);

  applicationName: InputSignal<string> = input.required();
  toolbarItems: InputSignal<IToolbarItem[]> = input.required();

  async redirect(url: string) {
    await this.#router.navigate([url]);
  }
}
