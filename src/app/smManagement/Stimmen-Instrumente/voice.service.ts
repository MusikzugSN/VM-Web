import { Injectable } from '@angular/core';
import {IMetaData, mockMetaData} from '@vm-utils';

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
export class VoiceService {
  voice: Voice[] = [];

  public voiceListe: Voice[] = [
    {
      voiceId: 1,
      name: 'Stimme 1',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 2,
      name: 'Stimme 2',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 3,
      name: 'Stimme 3',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 4,
      name: 'Stimme 1',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 5,
      name: 'Stimme 2',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 6,
      name: 'Stimme 3',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 7,
      name: 'Stimme 4',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
  ];

  getVoiceById(voiceId: number): Voice | undefined {
    return this.voice.find((Id) => Id.voiceId === voiceId);
  }
}
