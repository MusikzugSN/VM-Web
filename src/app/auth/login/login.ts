import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Form} from '@vm-components';
import {AuthService} from '../auth.service';
import {Dictionary} from '@vm-utils';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    Form
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  async loginClicked(data: Dictionary<string>) {
    const result = await this.#authService.login(data['username'], data['password']);
    if (result.success) {
      await this.#router.navigate(['/']);
    } else {
      // snackbarservice...
    }
  }
}
