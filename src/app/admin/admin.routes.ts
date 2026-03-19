import { Routes } from '@angular/router';
import { AppLoginSettings } from './loginSettigs/app-loginSettings.component';
import { AppGroups } from './goups/app-groups.component';
import { AppRoles } from './roles/app-roles.component';
import { AppUsers } from './users/app-users.component';
import { AppAdminLayout } from './app-admin-layout.component';
import {AuthGuard} from '../auth/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AppAdminLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'loginSettings', pathMatch: 'full' },
      { path: 'loginSettings', component: AppLoginSettings },
      { path: 'groups', component: AppGroups },
      { path: 'roles', component: AppRoles },
      { path: 'users', component: AppUsers },
    ],
  },
];
