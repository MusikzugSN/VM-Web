import { Routes } from '@angular/router';
import { AppMeLayout } from './app-me-layout.component';
import { AppAllNotesComponent } from './allNotes/app-allNotes.component';

export const ME_ROUTES: Routes = [
  {
    path: '',
    component: AppMeLayout,
    children: [
      { path: '', redirectTo: 'allNotes', pathMatch: 'full' },
      { path: 'allNotes', component: AppAllNotesComponent },
    ],
  },
];
