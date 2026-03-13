import { inject, Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MusicSheet extends IMetaData {
  musicSheetId: number;
  pageCount: number;
  scoreId: number;
  voiceId: number;
  voiceName: string;
}

export interface CreateMusicSheetRequest {
  scoreId: number;
  voiceId: number;
  pageCount?: number;
  filePath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MusicSheetService extends BaseCrudService<MusicSheet, CreateMusicSheetRequest> {
  readonly #httpClient = inject(HttpClient);
  override url: string = 'musicSheet';

  loadByScoreAndVoice$(scoreId: number, voiceId: number): Observable<MusicSheet[]> {
    return this.#httpClient.get<MusicSheet[]>(`musicSheet/score/${scoreId}/voice/${voiceId}`);
  }
}
