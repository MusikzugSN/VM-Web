import { Component, inject } from '@angular/core';
import { Folder, FoldersService } from './folders.service';
import { ActivatedRoute} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import { VmpNotesFullPageComponent } from '@vm-parts';
import { AllNotesData } from '../../smManagement/repository/app-repository.component';


@Component({
  selector: 'app-folders.component',
  imports: [ VmpNotesFullPageComponent],
  templateUrl: './app-folders.component.html',
  styleUrl: './app-folders.component.scss',
})
export class AppFolderMeComponent {
  folder?: Folder;

  isError = false;

  notes: AllNotesData[] = [];
  private route = inject(ActivatedRoute);
  protected foldersServiceComponent = inject(FoldersService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('folderId')),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((folderId) => {
        this.isError = false;



        if (!folderId) {
          this.isError = true;
          return;
        }

        const found = this.foldersServiceComponent.getFolderById(+folderId);

        if (found) {
          this.folder = found;
          this.isError = false;
        } else {
          this.isError = true;
          this.folder = undefined;
        }
      });
  }
}
