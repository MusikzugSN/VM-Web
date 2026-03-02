import { Component, inject } from '@angular/core';
import {VmcDataGrid, VmcInputField, VmColumn, VmcToolbar, VmFormField, VmToolbarItem } from '@vm-components';
import { Folder, FoldersService } from '../../me/folders/folders.service';

@Component({
  selector: 'app-folders-conf',
  imports: [VmcDataGrid, VmcToolbar, VmcInputField],
  templateUrl: './app-folders-conf.component.html',
  styleUrl: './app-folders-conf.component.scss',
})
export class AppFoldersConfComponent {
  folderService = inject(FoldersService);

  folderListe = this.folderService.mappenListe;

  items: VmToolbarItem[] = [
    {
      key: 'addFolder',
      icon: 'add',
      label: 'Mappe Hinzufügen',
      acton: async () => {},
    },
  ];

  suchleiste: VmFormField = {
    key: 'suchleiste',
    type: 'search',
    label: 'Suchleiste',
  };

  column: VmColumn<Folder>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'membercount', header: 'Anzahl der Mitglieder', field: 'membercount' },
    { key: 'updatedAt', header: 'Bearbeiten am', field: 'updatedAt' },
    { key: 'updatedBy', header: 'Bearbeitet von', field: 'updatedBy' },
  ];
}
