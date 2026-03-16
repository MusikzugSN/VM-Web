import { Injectable } from '@angular/core';
import {BaseCrudService, IMetaData} from '@vm-utils';

export interface Voice extends IMetaData{
  voiceId: number;
  name: string;
  instrumentId: number;
  instrumentName: string;
  alternativeVoiceId?: number;
  alternateVoiceIds?: number[];
  countOfMusicsheets?: number;
  countOfAlternatives?: number;
}

export interface VoiceQueryParams {
  includeAlternateVoices?: boolean;
  includeInstrumentName?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService extends BaseCrudService<Voice, Voice, VoiceQueryParams> {
    override url = 'voice';

}
