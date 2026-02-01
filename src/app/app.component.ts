import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { VmpNavbar } from '@vm-parts';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '@vm-utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VmpNavbar, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  readonly authService = inject(AuthService);
  readonly #router = inject(Router);

  async logout(): Promise<void> {
    this.authService.logout();
    await this.#router.navigate(['auth', 'login']);
  }
}
