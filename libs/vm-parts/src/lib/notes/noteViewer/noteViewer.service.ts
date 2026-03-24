import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { ConfigService } from '@vm-utils';
import { HttpClient } from '@angular/common/http';

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

export class NotesViewerService {
  readonly #config = inject(ConfigService);
  readonly #httpClient = inject(HttpClient);

  hostedUrl$: Observable<string> = this.#config.config$.pipe(
    map((x) => x?.backedApiUrl + '/PdfViewer'),
  );

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
