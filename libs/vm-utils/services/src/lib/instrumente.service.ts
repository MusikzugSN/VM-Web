import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface Instrument extends IMetaData {
  instrumentId: number;
  name: string;
  type: string;
  voicelist?: Array<Instrument>;
}

@Injectable({
  providedIn: 'root',
})
export class InstrumentService extends BaseCrudService<Instrument> {
  override url = 'instrument';
}
