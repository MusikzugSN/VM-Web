import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface Score extends IMetaData {
  scoreId: number;
  title: string;
  composer: string;
  link: string;
  folders: ScoreMusicFolder[];
}
export interface ScoreMusicFolder extends IMetaData {
  scoreMusicFolderId: number;
  musicFolderId: number;
  musicFolderName: string;
  number: number;
}
@Injectable({
  providedIn: 'root',
})
export class ScoreService extends BaseCrudService<Score> {
  override url: string = 'score';
}
