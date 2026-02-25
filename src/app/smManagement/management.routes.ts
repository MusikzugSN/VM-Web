
import { AppManagementLayout } from './app-management-layout';
import { AppUnverifiedComponent } from './unverified/app-unverified.component';
import { AppRepositoryComponent } from './repository/app-repository.component';
import { AppFoldersComponent } from './folders/app-folders.component';
import { Routes } from '@angular/router';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppManagementLayout,
    children: [
      { path: '', redirectTo: 'unverified', pathMatch: 'full' },
      { path: 'unverified', component: AppUnverifiedComponent },
      { path: 'repository', component: AppRepositoryComponent },
      { path: 'folders', component: AppFoldersComponent },
    ],
  },
];
