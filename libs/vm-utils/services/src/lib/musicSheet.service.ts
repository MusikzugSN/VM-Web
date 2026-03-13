import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface MusicSheet extends IMetaData {
  musicSheetId: number;
  pageCount: number;
  scoreId: number;
  voiceId: number;
  voiceName: string;
}

@Injectable({
  providedIn: 'root',
})
export class MusicSheetService extends BaseCrudService<MusicSheet> {
  override url: string = 'musicSheet';
}
