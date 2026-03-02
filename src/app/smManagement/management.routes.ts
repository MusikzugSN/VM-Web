
import { AppManagementLayout } from './app-management-layout';
import { AppUnverifiedComponent } from './unverified/app-unverified.component';
import { AppRepositoryComponent } from './repository/app-repository.component';
import { Routes } from '@angular/router';
import { AppFoldersAdminComponent } from './folders/app-folders.component';
import { AppStimmenInstrumenteComponent } from './Stimmen-Instrumente/app-stimmen-instrumente.component';
import { AppFoldersConfComponent } from './folders-conf/app-folders-conf.component';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppManagementLayout,
    children: [
      { path: '', redirectTo: 'unverified', pathMatch: 'full' },
      { path: 'unverified', component: AppUnverifiedComponent },
      { path: 'repository', component: AppRepositoryComponent },
      { path: 'folders', component: AppFoldersAdminComponent },
      { path: 'folders-conf', component: AppFoldersConfComponent },
      { path: 'stimmen-instrumente', component: AppStimmenInstrumenteComponent },
    ],
  },
];
