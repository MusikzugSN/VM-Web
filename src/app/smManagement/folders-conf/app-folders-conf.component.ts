import { Component, inject } from '@angular/core';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmRowClickedEvent,
  VmToolbarItem,
} from '@vm-components';
import { Folder, FoldersService } from '@vm-utils/services';
import {BehaviorSubject, firstValueFrom, map, Observable, switchMap} from 'rxjs';
import {FolderDialogService} from './folder-conf-dialog.service';
import {AsyncPipe} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {AsPipe, NumDictionary} from '@vm-utils';
import {Group, GroupService} from '@vm-utils/services';


@Component({
  selector: 'app-folders-conf',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField, AsyncPipe, AsPipe],
  templateUrl: './app-folders-conf.component.html',
  styleUrl: './app-folders-conf.component.scss',
})
export class AppFoldersConfComponent {
  readonly #folderService = inject(FoldersService);
  readonly #folderDataDialogService = inject(FolderDialogService);
  readonly #groupService = inject(GroupService);

  #reload = new BehaviorSubject(false);
  folderListe$ = this.#reload.pipe(switchMap(_x => this.#folderService.load$()));

  #filterTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  filterTerm = toSignal<string, string>(this.#filterTerm$, {
    initialValue: '',
  });

  #groups$ = this.#groupService.load$();

  #groupsById$: Observable<NumDictionary<Group>> = this.#groups$.pipe(
    map((x) =>
      x.reduce((acc, score) => ({ ...acc, [score.groupId]: score }), {} as NumDictionary<Group>),
    ),
  );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>>(this.#groupsById$, {
    initialValue: {},
  });

  // @ts-ignore
  FolderType: Folder;

  items: VmToolbarItem[] = [
    {
      key: 'addFolder',
      icon: 'add',
      label: 'Mappe hinzufügen',
      action: async (): Promise<void> => {
        await this.#folderDataDialogService.openNewFolderDialog();
        this.#reload.next(true);
      },
    },
  ];
  async execAction(action: VmRowClickedEvent<Folder>): Promise<void> {
    if (action.key === 'edit') {
      if (!action.rowData) {
        return;
      }

      const folderWithSheets = await firstValueFrom(
        this.#folderService.loadByIdWithSheets$(action.rowData.musicFolderId),
      );
      const reload = await this.#folderDataDialogService.openEditFolderDialog(folderWithSheets);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#folderDataDialogService.openDeleteFolderDialog(action.rowData!);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  suchleiste: VmFormField = {
    key: 'suchleiste',
    type: 'search',
    label: 'Suchleiste',
  };

  column: VmColumn<Folder>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'groupId', header: 'Gruppe', field: 'groupId', type: 'template', filterable: true },
    { key: 'membercount', header: 'Anzahl der Stücke', field: 'membercount' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];

  filterInputChanged(term:string | number): void {
    this.#filterTerm$.next(term.toString());
  }
}
