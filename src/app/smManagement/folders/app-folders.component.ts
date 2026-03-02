import { Component } from '@angular/core';
import { VmcDataGrid, VmcInputField, VmColumn, VmcToolbar, VmFormField, VmToolbarItem } from '@vm-components';
import { Folder } from '../../me/folders/folders.service';

@Component({
  selector: 'app-folders.component',
  imports: [VmcToolbar, VmcInputField, VmcDataGrid],
  templateUrl: './app-folders.component.html',
  styleUrl: './app-folders.component.scss',
})
export class AppFoldersAdminComponent {
  data: Folder[] = [];

  // #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addFolder',
      icon: 'add',
      label: 'Mappe hinzufügen',
      acton: async (): Promise<void> => {},
    },
    {
      key: 'Herunterladen',
      icon: 'file_download',
      label: 'Herunterladen',
      acton: async (): Promise<void> => {},
    },
  ];

  suchleiste: VmFormField = {
    key: 'seachbar',
    type: 'search',
    label: 'Suchen',
  };

  columns: VmColumn<Folder>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'membercount', header: 'Anzahlmember', field: 'membercount' },
    { key: 'created', header: 'Erstellt am', field: 'created' },
    { key: 'edited', header: 'Bearbeitet am', field: 'edited' },
  ];
}
