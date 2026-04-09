import { IMetaData } from './meta-data.type';

export interface Score extends IMetaData {
  scoreId: number;
  title: string;
  composer: string;
  link: string;
  length: number;
  folders: ScoreMusicFolder[];
}

export interface ScoreMusicFolder extends IMetaData {
  scoreMusicFolderId: number;
  musicFolderId: number;
  musicFolderName: string;
  number: number;
}
