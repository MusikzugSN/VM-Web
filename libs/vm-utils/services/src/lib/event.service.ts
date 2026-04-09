import { Injectable } from '@angular/core';
import {
  BaseCrudService,
  convertMetaDataFromDto,
  convertMetaDataFromDtos,
  IMetaData,
} from '@vm-utils';
import { map, Observable } from 'rxjs';

export interface Event extends IMetaData {
  eventId: number;
  name: string;
  groupId?: number;
  date?: string;
  showInMyArea: boolean;
  scores?: EventScoreTeaser[];
}

export interface EventScoreTeaser {
  scoreId: number;
  deleted?: boolean;
}

export interface EventMusicSheetTeaser extends EventScoreTeaser {
  number?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService extends BaseCrudService<Event> {
  override url = 'event';

  loadForMyArea$(): Observable<Event[]> {
    return this.httpClient
      .get<Event[]>(this.url + '/forMyArea')
      .pipe(map((event) => convertMetaDataFromDtos(event)));
  }

  loadByIdWithScores$(id: number): Observable<Event> {
    return this.httpClient
      .get<Event>(`${this.url}/${id}?includeScores=true`)
      .pipe(map((event) => convertMetaDataFromDto(event)));
  }
}
