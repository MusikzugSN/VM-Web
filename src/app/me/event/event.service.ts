import { Injectable } from '@angular/core';

export interface Event {
  eventId: number;
  name: string;
  disbaledAb?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events: Event[] = [];

  public eventListe: Event[] = [
    { eventId: 1, name: 'Blechgewitter'},
    { eventId: 2, name: 'Klangfusion'},
    { eventId: 3, name: 'Marsch-Momente'},
    { eventId: 4, name: 'Harmonie-Abend'},
    { eventId: 5, name: 'Luftnummer'},
  ];

  getEventById(eventId: number): Event | undefined {
    return this.events.find(e => e.eventId === eventId);
  }
}
