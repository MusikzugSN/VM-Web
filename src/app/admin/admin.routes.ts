import { Routes } from '@angular/router';
import { AppGeneral } from './general/app-general.component';
import { AppGroups } from './goups/app-groups.component';
import { AppRoles } from './roles/app-roles.component';
import { AppUsers } from './users/app-users.component';
import { AppAdminLayout } from './app-admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AppAdminLayout,
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', component: AppGeneral },
      { path: 'groups', component: AppGroups },
      { path: 'roles', component: AppRoles },
      { path: 'users', component: AppUsers },
    ],
  },
];
