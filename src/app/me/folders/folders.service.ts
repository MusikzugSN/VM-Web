import { Injectable } from '@angular/core';
import { AllNotesData } from '../../smManagement/repository/app-repository.component';
import {IMetaData, mockMetaData} from '@vm-utils';

export interface Folder extends IMetaData {
  folderId: number;
  name: string;
  slug?: string;
  notes?: AllNotesData[];
  membercount?: number;
  created?: string;
  edited?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FoldersService {
  private folders: Folder[] = [];

  public mappenListe: Folder[] = [
    { folderId: 1, name: 'Testmappe', membercount: 22, ...mockMetaData() },
    { folderId: 2, name: 'Noten 2026', membercount: 12, ...mockMetaData() },
    { folderId: 3, name: 'Alt-Saxophon', membercount: 6, ...mockMetaData() },
    { folderId: 4, name: 'Weihnachtskonzert', membercount: 90, ...mockMetaData() },
    { folderId: 5, name: 'Marschmusik', membercount: 54, ...mockMetaData() },
    { folderId: 6, name: 'MarschmusikNr2', membercount: 54, ...mockMetaData() },
  ];

  getFolderById(folderId: number): Folder | undefined {
    return this.folders.find((Id) => Id.folderId === folderId);
  }
}
