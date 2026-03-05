import { Injectable } from '@angular/core';
import { AllNotesData } from '../../smManagement/repository/app-repository.component';
import { BaseCrudService, IMetaData} from '@vm-utils';

export interface Folder extends IMetaData {
  musicFolderId: number;
  name: string;
  groupId: number;
  notes?: AllNotesData[];
  membercount: number;
  sheets?: FolderMusicSheetTeaser[];
}
export interface UpdateFolder {
  musicFolderId: number;
  name: string;
  groupId: number;
  notes?: AllNotesData[];
  membercount: number;
  sheets?: FolderMusicSheetTeaser[];
}
export interface FolderMusicSheetTeaser {
  number: number;
  scoreId: number;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FoldersService extends BaseCrudService<Folder> {
  override url: string = 'musicFolder';
}
