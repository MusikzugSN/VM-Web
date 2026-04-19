import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '@vm-utils/services';

export function authTokenInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  return authService.accessToken$.pipe(
    take(1),
    switchMap((token) => {
      const authReq = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : req;

      return next(authReq);
    }),
  );
}
