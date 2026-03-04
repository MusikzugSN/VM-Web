import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData, mockMetaData } from '@vm-utils';

export interface Event extends IMetaData {
  eventId: number;
  name: string;
  groupId?: number;
  disbaledAb?: string;
  activUntil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService extends BaseCrudService<Event> {
  override url = 'event';
  private events: Event[] = [];

  public eventListe: Event[] = [
    { eventId: 1, name: 'Blechgewitter', ...mockMetaData() },
    { eventId: 2, name: 'Klangfusion', ...mockMetaData() },
    { eventId: 3, name: 'Marsch-Momente', ...mockMetaData() },
    { eventId: 4, name: 'Harmonie-Abend', ...mockMetaData() },
    { eventId: 5, name: 'Luftnummer', ...mockMetaData() },
  ];

  getEventById(eventId: number): Event | undefined {
    return this.events.find((e) => e.eventId === eventId);
  }
}
