import { Injectable } from '@angular/core';
import {BaseCrudService, convertMetaDataFromDtos, IMetaData} from '@vm-utils';
import {map, Observable} from 'rxjs';

export interface Event extends IMetaData {
  eventId: number;
  name: string;
  groupId?: number;
  disbaledAb?: string;
  activUntil?: string;
  showInMyArea: boolean;
  sheets?: EventMusicSheetTeaser[];
}

export interface EventMusicSheetTeaser {
  number: string;
  scoreId: number;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventService extends BaseCrudService<Event> {
  override url = 'event';

  loadForMyArea$(): Observable<Event[]> {
    return this.httpClient
      .get<Event[]>(this.url + '/forMyArea')
      .pipe(map(event => convertMetaDataFromDtos(event)));
  }
}
