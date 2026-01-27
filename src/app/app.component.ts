import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {VmpNavbar} from '@vm-parts';
import {AuthService} from './auth/auth.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VmpNavbar, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  readonly authService = inject(AuthService);
  readonly #router = inject(Router);

  logout() {
    this.authService.logout()
    this.#router.navigate(['auth','login']);
  }
}
