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
import { Folder, FoldersService } from '../../me/folders/folders.service';
import {BehaviorSubject} from 'rxjs';
import {FolderDialogService} from './folder-conf-dialog.service';


@Component({
  selector: 'app-folders-conf',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField],
  templateUrl: './app-folders-conf.component.html',
  styleUrl: './app-folders-conf.component.scss',
})
export class AppFoldersConfComponent {
  #folderService = inject(FoldersService);
  #folderDataDialogService = inject(FolderDialogService);

  folderListe = this.#folderService.mappenListe;

  #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addFolder',
      icon: 'add',
      label: 'Mappe Hinzufügen',
      acton: async (): Promise<void> => {
        await this.#folderDataDialogService.openNewFolderDialog();
        this.#reload.next(true);
      },
    },
  ];
  async execAction(action: VmRowClickedEvent<Folder>): Promise<void> {
    if (action.key === 'edit') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reload = await this.#folderDataDialogService.openEditFolderDialog(action.rowData!);
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
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'membercount', header: 'Anzahl der Mitglieder', field: 'membercount' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt', type: 'date' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];
}
