import {inject, Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  RedirectCommand, Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from './auth.service';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router)

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<GuardResult> {
    const isLogedIn = await firstValueFrom(this.#authService.isLoggedIn$());
    if (!isLogedIn) {
      const loginPath = this.#router.parseUrl("/auth/login");
      return new RedirectCommand(loginPath, {skipLocationChange: false});
    }

    const isLoginExpired = await firstValueFrom(this.#authService.isLoginExpired$());
    if (isLoginExpired) {
      this.#authService.logout();
      const loginExpiredPath = this.#router.parseUrl("/auth/login");
      return new RedirectCommand(loginExpiredPath, {skipLocationChange: false});
    }

    return true;
  }

}
