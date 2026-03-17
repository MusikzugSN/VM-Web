import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface Event extends IMetaData {
  eventId: number;
  name: string;
  groupId?: number;
  disbaledAb?: string;
  activUntil?: string;
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
}
