import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { filter, Observable, switchMap, take } from 'rxjs';
import { inject } from '@angular/core';
import { ConfigService } from '../config/config.service';

export function baseUrlInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const configService = inject(ConfigService);
  return configService.config$.pipe(
    filter((cfg) => !!cfg),
    take(1),
    switchMap((cfg) => {
      const isAbsolute = req.url.startsWith('http://') || req.url.startsWith('https://');
      if (isAbsolute) {
        // OIDC Discovery, Token Endpoint, externe APIs → NICHT anfassen
        return next(req);
      }

      const apiReq = req.clone({ url: `${cfg.backedApiUrl}/api/v1/${req.url}` });
      return next(apiReq);
    }),
  );
}
