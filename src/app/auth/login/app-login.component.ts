import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {VmcButton, VmcForm, VmValidFormTypes} from '@vm-components';
import {AuthService, OAuthProvider} from '@vm-utils';
import { Dictionary } from '@vm-utils';
import { Router } from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {ConfigService} from '@vm-utils';
import {filter, map} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [VmcForm, AsyncPipe, VmcButton],
  templateUrl: './app-login.component.html',
  styleUrl: './app-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLogin {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #config = inject(ConfigService);

  oauthProviders$ = this.#config.oauthProviders$;
  bannerLink$ = this.#config.config$
    .pipe(
      map(x => x?.images.loginBanner),
      filter(x => x != null),
      map(x => '/static' + x))

  async oauthProviderClicked(provider: OAuthProvider): Promise<void> {
    await this.#authService.initOAuthLogin(provider);
  }

  async loginClicked(data: Dictionary<VmValidFormTypes>): Promise<void> {
    const username = data['username'] as string;
    const password = data['password'] as string;

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
