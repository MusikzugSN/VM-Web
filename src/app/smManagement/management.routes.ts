
import { AppManagementLayout } from './app-management-layout';
import { AppUnverifiedComponent } from './unverified/app-unverified.component';
import { AppRepositoryComponent } from './repository/app-repository.component';
import { Routes } from '@angular/router';
import { AppStimmenInstrumenteComponent } from './Stimmen-Instrumente/app-stimmen-instrumente.component';
import { AppEventConfComponent } from './event-conf/app-event.conf.component';
import { AppFolderScoreComponent } from './folders/app-folders.component';
import { AppFoldersConfComponent } from './folders-conf/app-folders-conf.component';
import { TagsConfComponent } from './tags-conf/tags-conf.component';
import { PrintConfComponent } from './print-conf/print-conf.component';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppManagementLayout,
    children: [
      { path: '', redirectTo: 'unverified', pathMatch: 'full' },
      { path: 'unverified', component: AppUnverifiedComponent },
      { path: 'repository', component: AppRepositoryComponent },
      { path: 'folders', children: [{ path: ':folderId', component: AppFolderScoreComponent }] },
      { path: 'folders-conf', component: AppFoldersConfComponent },
      { path: 'stimmen-instrumente', component: AppStimmenInstrumenteComponent },
      { path: 'event-conf', component: AppEventConfComponent },
      { path: 'tags', component: TagsConfComponent },
      { path: 'print-conf', component: PrintConfComponent },
    ],
  },
];
