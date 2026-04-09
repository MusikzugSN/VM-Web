import { Component, computed, inject, signal } from '@angular/core';

import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import {
  Folder,
  FoldersService,
  PermissionService,
  PermissionType,
  Score,
  ScoreService,
} from '@vm-utils/services';
import {
  VmcDataGrid,
  VmcIconButton,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmInputField,
  VmToolbarItem,
} from '@vm-components';
import { RepositoryDialogService } from './repository-dialog.service';
import { AsyncPipe } from '@angular/common';
import { AsPipe, convertToDisplayMinutes, NumDictionary } from '@vm-utils';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-repository.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe, VmcIconButton, AsPipe],
  templateUrl: './app-repository.component.html',
  styleUrl: './app-repository.component.scss',
})
export class AppRepositoryComponent {
  readonly #scoresService = inject(ScoreService);
  readonly #dataDialogService = inject(RepositoryDialogService);
  readonly #foldersService = inject(FoldersService);
  readonly #permissionService = inject(PermissionService);

  #reload = new BehaviorSubject(false);

  data$ = this.#reload.pipe(
    switchMap((_) => this.#scoresService.load$({ includeMusicFolders: true })),
  );
  #folders$: Observable<Folder[]> = this.#foldersService.load$();

  canCreateScore = toSignal(this.#permissionService.hasPermission$(PermissionType.CreateScore), {
    initialValue: false,
  });
  canUpdateScore = toSignal(this.#permissionService.hasPermission$(PermissionType.UpdateScore), {
    initialValue: false,
  });
  canDeleteScore = toSignal(this.#permissionService.hasPermission$(PermissionType.DeleteScore), {
    initialValue: false,
  });

  searchterm = signal<string | undefined>(undefined);

  #folderById$: Observable<NumDictionary<Folder>> = this.#folders$.pipe(
    map((x) =>
      x.reduce(
        (acc, folder) => ({ ...acc, [folder.musicFolderId]: folder }),
        {} as NumDictionary<Folder>,
      ),
    ),
  );

  folderById = toSignal<NumDictionary<Folder>, NumDictionary<Folder>>(this.#folderById$, {
    initialValue: {},
  });

  toolbarItems = computed<VmToolbarItem[]>(() => {
    if (!this.canCreateScore()) {
      return [];
    }

    return [
      {
        key: 'addNotes',
        icon: 'add',
        label: 'Stück hinzufügen',
        action: async (): Promise<void> => {
          await this.#dataDialogService.openNewScoreDialog();
          this.#reload.next(true);
        },
      },
      {
        key: 'addMultiNotes',
        icon: 'add',
        label: 'Mehrere Stücke hinzufügen',
        action: async (): Promise<void> => {
          await this.#dataDialogService.openNewScoreMulitDialog();
          this.#reload.next(true);
        },
      },
    ];
  });

  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  columns: VmColumn<Score>[] = [
    { key: 'title', header: 'Title', field: 'title', filterable: true },
    { key: 'composer', header: 'Komponist', field: 'composer', filterable: true },
    {
      key: 'duration',
      header: 'Länge',
      field: 'duration',
      type: 'converter',
      converter: (score: Score) => convertToDisplayMinutes(score.duration ?? 0) + ' min',
    },
    { key: 'folders', header: 'Mappen', field: 'musicFolders', type: 'template' },
    { key: 'changedAt', header: 'Bearbeitet am', field: 'updatedAt', type: 'date-time' },
    { key: 'changedBy', header: 'Bearbeitet von', field: 'updatedBy' },
    { key: 'customActions', header: '', type: 'template' },
  ];

  // @ts-ignore
  ScoreType: Score;

  async execAction(rowData: Score, key: string): Promise<void> {
    if (key === 'edit') {
      const reload = await this.#dataDialogService.openEditScoreDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (key === 'delete') {
      const reload = await this.#dataDialogService.openDeleteScoreDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (key === 'link') {
      window.open(rowData.link, '_blank');
    }
  }
}
