import { Routes } from '@angular/router';
import { AppMeLayout } from './app-me-layout.component';
import {AppTagsComponent} from './tags/app-tags.component';
import { AppEventComponent } from './event/app-event.component';
import { AppFolderMeComponent } from './folders/app-folders.component';

export const ME_ROUTES: Routes = [
  {
    path: '',
    component: AppMeLayout,
    children: [
      { path: '', redirectTo: 'folders', pathMatch: 'full' },
      { path: 'event', children: [
          { path: ':eventId', component: AppEventComponent },
        ]
      },
      { path: 'tag', children: [
          { path: ':tagId', component: AppTagsComponent },
          ]
        },
      {
        path: 'folders',
        children: [
          { path: '', component: AppFolderMeComponent },
          { path: ':folderId', component: AppFolderMeComponent }
        ]
      }
    ]
  },
];
