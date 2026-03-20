import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { ConfigService } from '@vm-utils';
import { HttpClient } from '@angular/common/http';

export interface ScorePageRangeDTO {
  scoreId: number;
  fromPage: number;
  toPage: number;
}

export interface ScoreVoicePageRangeDTO {
  scoreId: number;
  voiceId: number;
  fromPage: number;
  toPage: number;
}

export interface CropPdfSeparateRangesRequest {
  file: File;
  scoreRanges: ScorePageRangeDTO[];
  voiceRanges: ScoreVoicePageRangeDTO[];
}

export class NotesViewerService {
  readonly #config = inject(ConfigService);
  readonly #httpClient = inject(HttpClient);

  hostedUrl$: Observable<string> = this.#config.config$.pipe(
    map((x) => x?.backedApiUrl + '/PdfViewer'),
  );

  cropPdfByScoreVoices$(req: CropPdfSeparateRangesRequest): Observable<unknown> {
    const form = new FormData();
    form.append('File', req.file, req.file.name);
    form.append('ScoreRangesJson', JSON.stringify(req.scoreRanges));
    form.append('VoiceRangesJson', JSON.stringify(req.voiceRanges));

    return this.#httpClient.post('pdf/crop-by-pdf', form);
  }
}
