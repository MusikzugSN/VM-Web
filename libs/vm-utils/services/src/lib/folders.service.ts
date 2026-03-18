import { Injectable } from '@angular/core';
import {BaseCrudService, convertMetaDataFromDto, convertMetaDataFromDtos, IMetaData} from '@vm-utils';
import {AllNotesData} from '@vm-parts';
import {map, Observable} from 'rxjs';

export interface Folder extends IMetaData {
  musicFolderId: number;
  name: string;
  groupId: number;
  showInMyArea: boolean;
  notes?: AllNotesData[];
  membercount: number;
  sheets?: FolderMusicSheetTeaser[];
}
export interface UpdateFolder {
  musicFolderId: number;
  name: string;
  groupId: number;
  showInMyArea: boolean;
  notes?: AllNotesData[];
  membercount?: number;
  sheets?: FolderMusicSheetTeaser[];
}
export interface FolderMusicSheetTeaser {
  number: string;
  scoreId: number;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FoldersService extends BaseCrudService<Folder> {
  override url: string = 'musicFolder';

  loadForMyArea$(): Observable<Folder[]> {
    return this.httpClient
      .get<Folder[]>(this.url + '/forMyArea')
      .pipe(map(folder => convertMetaDataFromDtos(folder)));
  }

  loadWithSheets$(): Observable<Folder[]> {
    return this.httpClient
      .get<Folder[]>(this.url + '?includeSheets=true')
      .pipe(map(folder => convertMetaDataFromDtos(folder)));
  }

  loadByIdWithSheets$(id: number): Observable<Folder> {
    return this.httpClient
      .get<Folder>(`${this.url}/${id}?includeSheets=true`)
      .pipe(map(folder => convertMetaDataFromDto(folder)));
  }
}
