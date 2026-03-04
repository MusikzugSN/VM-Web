import { Injectable } from '@angular/core';
import { AllNotesData } from '../../smManagement/repository/app-repository.component';
import { BaseCrudService, IMetaData, mockMetaData} from '@vm-utils';
import { Score } from '../../smManagement/repository/score.service';

export interface Folder extends IMetaData {
  folderId: number;
  name: string;
  groupId?: number;
  notes?: AllNotesData[];
  membercount: number;
  stueck?: FolderStueckTeaser[];
}
export interface updateFolder {
  folderId: number;
  name: string;
  groupId?: number;
  notes?: AllNotesData[];
  membercount: number;
  stueck?: FolderStueckTeaser[];
}
export interface FolderStueckTeaser extends Score {
  folderId: number;
  ScoreId: number;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FoldersService extends BaseCrudService<Folder> {
  override url: string = 'folders';
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
