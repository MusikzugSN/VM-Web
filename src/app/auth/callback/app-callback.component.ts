import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@vm-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './app-callback.component.html',
  styleUrl: './app-callback.component.scss',
})
export class AppCallback implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.#authService.handleOAuthLoginCallback();
    await this.#router.navigate(['/']);
  }
}
