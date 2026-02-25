import { RouterModule, Routes } from '@angular/router';
import { AppFoldersComponent } from './app-folders.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: ':slug', component: AppFoldersComponent },
  { path: ':slug', component: AppFoldersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FoldersRoutingModule {}
