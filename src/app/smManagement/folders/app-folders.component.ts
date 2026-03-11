import { Component, inject} from '@angular/core';
import { Folder, FoldersService } from '@vm-utils/services';
import { ActivatedRoute } from '@angular/router';
import {distinctUntilChanged, firstValueFrom, map} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';

@Component({
  selector: 'app-folders.component',
  imports: [VmpNotesFullPageComponent],
  templateUrl: './app-folders.component.html',
  styleUrl: './app-folders.component.scss',
})
export class AppFolderScoreComponent {
  folders?: Folder;

  isError = false;
  notes: AllNotesData[] = [];
  private route = inject(ActivatedRoute);
  protected foldersService = inject(FoldersService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('folderId')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe(async (folderId) => {
        this.isError = false;

        if (!folderId) {
          this.isError = true;
          return;
        }

        const found = await firstValueFrom(this.foldersService.loadById$(+folderId));

        if (found) {
          this.folders = found;
          this.isError = false;
        } else {
          this.isError = true;
          this.folders = undefined;
        }
      });
  }
}
