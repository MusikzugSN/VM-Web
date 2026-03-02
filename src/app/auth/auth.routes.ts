import { Routes } from '@angular/router';
import { AppLogin } from './login/app-login.component';
import { AppCallback } from './callback/app-callback.component';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AppLogin },
  { path: 'callback', component: AppCallback },
];
