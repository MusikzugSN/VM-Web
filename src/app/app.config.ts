import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {baseUrlInterceptor, authTokenInterceptor, httpErrorInterceptor} from '@vm-utils';
import {provideOAuthClient} from 'angular-oauth2-oidc';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authTokenInterceptor, httpErrorInterceptor])),
    provideOAuthClient()
  ],
};
