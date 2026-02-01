import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VmcForm } from '@vm-components';
import { AuthService } from '@vm-utils';
import { Dictionary } from '@vm-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [VmcForm],
  templateUrl: './app-login.component.html',
  styleUrl: './app-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLogin {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  async loginClicked(data: Dictionary<string>): Promise<void> {
    const username = data['username'];
    const password = data['password'];

    if (username === undefined || password === undefined) {
      return;
    }

    const result = await this.#authService.login(username, password);
    if (result.success) {
      await this.#router.navigate(['/']);
    } else {
      // snackbarservice...
    }
  }
}
