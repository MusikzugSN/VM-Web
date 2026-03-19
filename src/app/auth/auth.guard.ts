import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@vm-utils/services';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = await firstValueFrom(authService.isLoggedIn$());
  if (!isLoggedIn) {
    const loginPath = router.parseUrl('/auth/login');
    return new RedirectCommand(loginPath, { skipLocationChange: false });
  }

  const isLoginExpired = await firstValueFrom(authService.isLoginExpired$());
  if (isLoginExpired) {
    authService.logout();
    const loginExpiredPath = router.parseUrl('/auth/login');
    return new RedirectCommand(loginExpiredPath, { skipLocationChange: false });
  }

  const myInformation = await firstValueFrom(authService.myInformation$);
  if (myInformation == null || (!myInformation.isAdmin && myInformation.permissions?.length === 0)) {
    const noPermissionPath = router.parseUrl('/auth/noPermission');
    return new RedirectCommand(noPermissionPath, { skipLocationChange: false });

  }

  return true;

  return true;
};
