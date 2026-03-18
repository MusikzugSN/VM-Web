import { Component, inject } from '@angular/core';
import { Folder, FoldersService } from '@vm-utils/services';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {distinctUntilChanged, firstValueFrom, map} from 'rxjs';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';


@Component({
  selector: 'app-folders',
  imports: [ VmpNotesFullPageComponent],
  templateUrl: './app-folders.component.html',
  styleUrl: './app-folders.component.scss',
})
export class AppFolderMeComponent {
  folder?: Folder;

  isError = false;

  notes: AllNotesData[] = [];
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected foldersService = inject(FoldersService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('folderId')),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe(async (folderId) => {
        this.isError = false;

        if (!folderId) {
          try {
            const myFolders = await firstValueFrom(this.foldersService.loadForMyArea$());
            const firstFolderId = myFolders[0]?.musicFolderId;

            if (firstFolderId == null) {
              this.folder = undefined;
              this.isError = true;
              return;
            }

            await this.router.navigate(['/me/folders', firstFolderId], { replaceUrl: true });
          } catch {
            this.folder = undefined;
            this.isError = true;
          }
          return;
        }

        try {
          const found = await firstValueFrom(this.foldersService.loadById$(+folderId));

          if (found) {
            this.folder = found;
            this.isError = false;
            return;
          }

          this.isError = true;
          this.folder = undefined;
        } catch {
          this.isError = true;
          this.folder = undefined;
        }
      });
  }
}
