import { Routes } from '@angular/router';
import { AppMeLayout } from './app-me-layout.component';
import {AppTagsComponent} from './tags/app-tags.component';
import { AppEventComponent } from './event/app-event.component';
import { AppFoldersComponent } from './folders/app-folders.component';

export const ME_ROUTES: Routes = [
  {
    path: '',
    component: AppMeLayout,
    children: [
      { path: '', redirectTo: 'folders/2', pathMatch: 'full' },
      { path: 'event', component: AppEventComponent },
      { path: 'tags', component: AppTagsComponent },
      { path: 'folders', children: [
          { path: ':folderId', component: AppFoldersComponent }
         ]
      }
    ]
  },
];
