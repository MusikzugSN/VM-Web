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
      name: '1',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 2,
      name: '2',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 3,
      name: '3',
      instrumentId: 1,
      instrumentName: 'Klarinette',
      countOfMusicsheets: 20,
      countOfAlternatives: 3,
      ...mockMetaData(),
    },
    {
      voiceId: 4,
      name: '1',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 5,
      name: '2',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 6,
      name: '3',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
    {
      voiceId: 7,
      name: '4',
      instrumentId: 2,
      instrumentName: 'Posaune',
      countOfMusicsheets: 12,
      countOfAlternatives: 4,
      ...mockMetaData(),
    },
  ];

  addVoice(name: string, instrumentId: number, instrumentName: string, countOfMusicsheets: number): void {
    const nextId = this.voiceListe.length > 0
      ? Math.max(...this.voiceListe.map((v) => v.voiceId)) + 1
      : 1;
    this.voiceListe.push({
      voiceId: nextId,
      name,
      instrumentId,
      instrumentName,
      countOfMusicsheets,
      countOfAlternatives: 0,
      ...mockMetaData(),
    });
  }

  getVoiceById(voiceId: number): Voice | undefined {
    return this.voice.find((Id) => Id.voiceId === voiceId);
  }
}
