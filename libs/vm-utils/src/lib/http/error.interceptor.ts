import {inject} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {SnackbarService} from '@vm-utils';
import {catchError, Observable, throwError} from 'rxjs';

export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn,): Observable<HttpEvent<unknown>> {
  const snackbarService = inject(SnackbarService);
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 0) {
      snackbarService.raiseError('Der Server ist nicht erreichbar, wende dich an deinen Administrator.');
    } else if (error.status === 401 && error.error != 'login_failed') {
      snackbarService.raiseError('Du bist nicht mehr angemeldet, melde dich erneut an.', 10000);
    } else if (error.status === 401 && error.error === 'login_failed') {
      snackbarService.raiseError('Der angegebene Benutzername oder das Passwort sind falsch.', 10000);
    } else if (error.status === 403 && error.error != 'login_failed') {
      snackbarService.raiseError('Es sind keine Rechte für das angegebene Element hinterlegt.', 10000);
    } else if (error.status === 403 && error.error === 'login_failed') {
      snackbarService.raiseError('Der angegebene Benutzer ist deaktiviert.', 10000);
    } else {
      console.log(error);
      snackbarService.raiseError(`Fehler ${error.status}: ${error.error?.message ?? 'Unbekannt'}`, 10000);
    }

    return throwError(() => error);
  }));
}
