import { Injectable } from '@angular/core';
import {
  BaseCrudService,
  convertMetaDataFromDto,
  convertMetaDataFromDtos,
  IMetaData,
} from '@vm-utils';
import { map, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface MusicSheet extends IMetaData {
  musicSheetId: number;
  pageCount: number;
  scoreId: number;
  voiceId: number;
  voiceName: string;
  tags?: MusicSheetTagTeaser[];
}

export interface MusicSheetTagTeaser {
  tagId: number;
  deleted?: boolean;
}

export interface MusicSheetQuerys {
  voiceIds?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class MusicSheetService extends BaseCrudService<MusicSheet, MusicSheet, MusicSheetQuerys> {
  override url: string = 'musicSheet';

  loadByIdWithTags$(id: number): Observable<MusicSheet> {
    return this.httpClient
      .get<MusicSheet>(`${this.url}/${id}?includeTags=true`)
      .pipe(map((musicSheet) => convertMetaDataFromDto(musicSheet)));
  }

  changeTags$(musicSheetId: number, tags: MusicSheetTagTeaser[]): Observable<MusicSheet> {
    return this.change$({ musicSheetId, tags }, musicSheetId);
  }

  private buildHttpParams(queryParams?: MusicSheetQuerys | undefined): HttpParams {
    let params = new HttpParams();

    if (!queryParams) return params;


    for (const [key, value] of Object.entries(queryParams)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {

        for (const v of value) {
          params = params.append(key, String(v));
        }
      } else {
        params = params.set(key, String(value));
      }
    }

    return params;
  }

  loadForUnverifieed$(queryParams?: MusicSheetQuerys | undefined): Observable<MusicSheet[]> {
    const params = this.buildHttpParams(queryParams);
    return this.httpClient
      .get<MusicSheet[]>(this.url + '/status/0', { params })
      .pipe(map((groups) => convertMetaDataFromDtos(groups)));
  }

  loadForFolder$(
    folderId: string,
    queryParams?: MusicSheetQuerys | undefined,
  ): Observable<MusicSheet[]> {
    const params = this.buildHttpParams(queryParams);
    return this.httpClient
      .get<MusicSheet[]>(this.url + '/folder/' + folderId, { params })
      .pipe(map((groups) => convertMetaDataFromDtos(groups)));
  }
}
