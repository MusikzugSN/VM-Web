import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import {VmpNoteViewer} from '@vm-parts';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'me',
    pathMatch: 'full',
  },
  {
    path: 'viewer',
    component: VmpNoteViewer
  },
  {
    path: 'me',
    loadChildren: () => import('./me/me.routes').then((x) => x.ME_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((x) => x.AUTH_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((x) => x.ADMIN_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'scores',
    loadChildren: () => import('./smManagement/management.routes').then((x) => x.MANAGEMENT_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'me',
  },
];
