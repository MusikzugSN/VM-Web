import { Injectable } from '@angular/core';
import { IMetaData, mockMetaData } from '@vm-utils';

export interface Instrument extends IMetaData{
  instrumentId: number;
  name: string;
  type: string;
  voicelist?: Array<Instrument>;
}

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  private instrument: Instrument[] = [];

  public instrumentListe: Instrument[] = [
    { instrumentId: 1, name: 'Klarinette', type: 'Holzblasinstrument', ...mockMetaData() },
    { instrumentId: 2, name: 'Posaune', type: 'blechblasinstrument', ...mockMetaData() },
    {
      instrumentId: 3,
      name: 'Pauke',
      type: 'Schlagwerk',
      ...mockMetaData()
    },
    { instrumentId: 4, name: 'Klavier', type: 'Tasteninstrument', ...mockMetaData() },
  ];

  array1: string[] = ['a', 'b'];
  array2: string[] = ['c', 'd', 'e', 'f'];
  array3: string[] = [...this.array1, ...this.array2];

  addInstrument(name: string, type: string): void {
    const nextId = this.instrumentListe.length > 0
      ? Math.max(...this.instrumentListe.map((i) => i.instrumentId)) + 1
      : 1;
    this.instrumentListe.push({
      instrumentId: nextId,
      name,
      type,
      ...mockMetaData(),
    });
  }

  getInstrumentById(instrumentId: number): Instrument | undefined {
    return this.instrument.find((Id) => Id.instrumentId === instrumentId);
  }
}
