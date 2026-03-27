import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import { FileData } from '@vm-components';
import {HttpClient} from '@angular/common/http';

export interface ScoreVoiceRangesDTO {
  scoreId: number;
  voiceId: number;
  fromPage: number;
  toPage: number;
}

export interface CropPdfByVoicesBatchRequest {
  file: File
  items: ScoreVoiceRangesDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class CropPdfService {
  readonly #httpClient = inject(HttpClient);

  #files$ = new BehaviorSubject<FileData[]>([]);
  files$ = this.#files$.asObservable();

  setFiles(files: FileData[]): void {
    this.#files$.next(files);
  }

  cropPdfByVoicesBatch$(req: CropPdfByVoicesBatchRequest): Observable<unknown> {
    const form = new FormData();
    form.append('File', req.file, req.file.name);

    req.items.forEach((item, itemIndex) => {
      form.append(`Ranges[${itemIndex}].ScoreId`, item.scoreId.toString());
      form.append(`Ranges[${itemIndex}].VoiceId`, item.voiceId.toString());
      form.append(`Ranges[${itemIndex}].FromPage`, item.fromPage.toString());
      form.append(`Ranges[${itemIndex}].ToPage`, item.toPage.toString());
    });

    return this.#httpClient.post('musicSheet/cropByVoices', form);
  }
}
