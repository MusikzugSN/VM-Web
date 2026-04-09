import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MusicSheet } from '@vm-utils/services';

export interface UploadScoreFileRequest {
  fileName: string;
  voiceId: number;
  file: File | File[];
}

export interface UploadScoreFilesRequest {
  scoreId: number;
  files: UploadScoreFileRequest[];
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  readonly #httpClient = inject(HttpClient);

  uploadScoreFiles$(req: UploadScoreFilesRequest): Observable<MusicSheet[]> {
    const form = new FormData();

    form.append('ScoreId', req.scoreId.toString());

    let index = 0;

    req.files.forEach((entry) => {
      const files = Array.isArray(entry.file) ? entry.file : [entry.file];

      files.forEach((file) => {
        form.append(`Files[${index}].FileName`, entry.fileName ?? file.name);
        form.append(`Files[${index}].VoiceId`, entry.voiceId.toString());
        form.append(`Files[${index}].File`, file, file.name);
        index += 1;
      });
    });

    return this.#httpClient.post<MusicSheet[]>('musicSheet/upload', form);
  }
}
