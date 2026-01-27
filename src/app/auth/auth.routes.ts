import {Routes} from '@angular/router';
import {AppLogin} from './login/app-login.component';

export const AUTH_ROUTES: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: AppLogin},
]
