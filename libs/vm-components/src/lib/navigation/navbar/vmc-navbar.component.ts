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
  selector: 'vmc-navbar',
  imports: [
    MatToolbar
  ],
  templateUrl: './vmc-navbar.component.html',
  styleUrl: './vmc-navbar.component.scss',
})
export class VmcNavbar {
  readonly #router = inject(Router);

  applicationName: InputSignal<string> = input.required();
  toolbarItems: InputSignal<IToolbarItem[]> = input.required();
  showToolbarItems: InputSignal<boolean> = input(false);

  async redirect(url: string) {
    await this.#router.navigate([url]);
  }
}
