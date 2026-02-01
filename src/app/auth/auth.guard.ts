import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@vm-utils';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  async canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Promise<GuardResult> {
    const isLoggedIn = await firstValueFrom(this.#authService.isLoggedIn$());
    if (!isLoggedIn) {
      const loginPath = this.#router.parseUrl('/auth/login');
      return new RedirectCommand(loginPath, { skipLocationChange: false });
    }

    const isLoginExpired = await firstValueFrom(this.#authService.isLoginExpired$());
    if (isLoginExpired) {
      this.#authService.logout();
      const loginExpiredPath = this.#router.parseUrl('/auth/login');
      return new RedirectCommand(loginExpiredPath, { skipLocationChange: false });
    }

    return true;
  }
}
