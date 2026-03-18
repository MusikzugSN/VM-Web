import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';
import {Observable} from 'rxjs';

export interface ScoreFolderEntry {
  musicFolderName: string;
  number: number;
  deleted?: boolean;
}

export interface Score extends IMetaData {
  scoreId: number;
  title: string;
  composer: string;
  link?: string;
  duration?: number;
  folders: ScoreFolderEntry[];
}

export interface CreateMultipleScore {
  title: string;
  composer: string;
  link?: string;
  duration?: number;
  folderName?: string;
  number?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ScoreService extends BaseCrudService<Score> {
  override url: string = 'score';

  createMultiple$(data: CreateMultipleScore[]): Observable<Score[]> {
    return this.httpClient.post<Score[]>(this.url + '/multiple', data);
  }
}
