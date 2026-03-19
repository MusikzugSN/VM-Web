import { Injectable } from '@angular/core';
import {BaseCrudService, convertMetaDataFromDtos, IMetaData} from '@vm-utils';
import {map, Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';

export interface MusicSheet extends IMetaData {
  musicSheetId: number;
  pageCount: number;
  scoreId: number;
  voiceId: number;
  voiceName: string;
}

export interface MusicSheetQuerys {
  voiceIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class MusicSheetService extends BaseCrudService<MusicSheet, MusicSheet, MusicSheetQuerys> {
  override url: string = 'musicSheet';

  loadForUnverifieed$(queryParams?: MusicSheetQuerys | undefined): Observable<MusicSheet[]> {
    let params = new HttpParams();

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== null && value !== undefined) {
          params = params.set(key, String(value));
        }
      }
    }

    return this.httpClient
      .get<MusicSheet[]>(this.url + '/status/0', { params })
      .pipe(map(groups => convertMetaDataFromDtos(groups)));
  }

  loadForFolder$(folderId: string, queryParams?: MusicSheetQuerys | undefined): Observable<MusicSheet[]> {
    let params = new HttpParams();

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== null && value !== undefined) {
          params = params.set(key, String(value));
        }
      }
    }

    return this.httpClient
      .get<MusicSheet[]>(this.url + '/folder/' + folderId, { params })
      .pipe(map(groups => convertMetaDataFromDtos(groups)));
  }
}
