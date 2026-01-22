import {Routes} from '@angular/router';
import {MeLayout} from './me/me-layout';
import {AuthGuard} from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'me',
    pathMatch: 'full'
  },
  {
    path: 'me',
    component: MeLayout,
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(x => x.AUTH_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'me'
  },
];
