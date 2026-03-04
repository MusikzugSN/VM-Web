import { Injectable } from '@angular/core';
import { IMetaData, mockMetaData } from '@vm-utils';

export interface Event extends IMetaData {
  eventId: number;
  name: string;
  disbaledAb?: string;
  activUntil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
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
