import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface ScoreFolderEntry {
  musicFolderName: string;
  number: number;
}

export interface Score extends IMetaData {
  scoreId: number;
  title: string;
  composer: string;
  link: string;
  duration?: number;
  folders: ScoreFolderEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class ScoreService extends BaseCrudService<Score> {
  override url: string = 'score';
}

