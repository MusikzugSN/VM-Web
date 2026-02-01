import {Component, inject, input, InputSignal} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {Router} from '@angular/router';

export interface INavbarItem {
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
  toolbarItems: InputSignal<INavbarItem[]> = input.required();
  showToolbarItems: InputSignal<boolean> = input(false);

  async redirect(url: string): Promise<void> {
    await this.#router.navigate([url]);
  }
}
