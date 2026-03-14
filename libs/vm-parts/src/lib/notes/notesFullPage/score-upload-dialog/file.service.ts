import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface UploadScoreFileRequest {
  fileName: string;
  voiceId: number;
  file: File;
}

export interface UploadScoreFilesRequest {
  scoreId: number;
  files: UploadScoreFileRequest[];
}


@Injectable({
  providedIn: 'root'
})
export class FileService {

  readonly #httpClient =inject(HttpClient);

  uploadScoreFiles$(req: UploadScoreFilesRequest): Observable<any> {
    const form = new FormData();

    form.append('ScoreId', req.scoreId.toString());

    req.files.forEach((f, i) => {
      form.append(`Files[${i}].FileName`, f.fileName);
      form.append(`Files[${i}].VoiceId`, f.voiceId.toString());
      form.append(`Files[${i}].File`, f.file, f.fileName);
    });

    return this.#httpClient.post('pdf/upload', form);
  }
}
