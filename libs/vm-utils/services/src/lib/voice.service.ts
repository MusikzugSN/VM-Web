import { Injectable } from '@angular/core';
import {BaseCrudService, IMetaData} from '@vm-utils';

export interface Voice extends IMetaData{
  voiceId: number;
  name: string;
  instrumentId: number;
  instrumentName: string;
  countOfMusicsheets?: number;
  countOfAlternatives?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService extends BaseCrudService<Voice> {
    override url = 'voice';

}
