import { Component, inject} from '@angular/core';
import { Folder, FoldersService } from '../../me/folders/folders.service';
import { AllNotesData } from '../repository/app-repository.component';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmpNotesFullPageComponent } from '@vm-parts';

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
  protected foldersServiceComponent = inject(FoldersService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('folderId')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((folderId) => {
        this.isError = false;

        if (!folderId) {
          this.isError = true;
          return;
        }

        const found = this.foldersServiceComponent.getFolderById(+folderId);

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
