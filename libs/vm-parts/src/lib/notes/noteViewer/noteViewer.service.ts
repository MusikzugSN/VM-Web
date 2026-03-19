
import {map, Observable} from 'rxjs';
import {inject} from '@angular/core';
import {ConfigService} from '@vm-utils';
import { HttpClient } from '@angular/common/http';

export interface VoicePageRangeDTO {
  voiceId: number;
  fromPage: number;
  toPage: number;
}

export interface CropPdfByVoicesRequest {
  scoreId: number;
  file: File;
  ranges: VoicePageRangeDTO[];
}

export class NotesViewerService {
  readonly #config = inject(ConfigService);
  readonly #httpClient = inject(HttpClient);

  hostedUrl$: Observable<string> = this.#config.config$.pipe(
    map(x => x?.backedApiUrl + '/PdfViewer'));

  cropPdfByVoices$(req: CropPdfByVoicesRequest): Observable<unknown> {
    const form = new FormData();
    form.append('ScoreId', req.scoreId.toString());
    form.append('File', req.file, req.file.name);
    form.append('RangesJson', JSON.stringify(req.ranges));

    return this.#httpClient.post('pdf/crop-by-voices', form)
  }
}
