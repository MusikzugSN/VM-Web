import {inject, Injectable} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {CreateMusicSheetRequest, MusicSheet, MusicSheetService} from '@vm-utils/services';

export interface UploadScoreFileRequest {
  fileName: string;
  filePath: string;
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
  readonly #musicSheetService = inject(MusicSheetService);

  uploadScoreFiles$(req: UploadScoreFilesRequest): Observable<MusicSheet[]> {
    const createCalls = req.files.map((f, index) => {
      const normalizedPath = (f.filePath ?? '').trim();
      const createRequest: CreateMusicSheetRequest = {
        scoreId: req.scoreId,
        voiceId: f.voiceId,
        pageCount: 1,
        filePath: normalizedPath.length > 0
          ? normalizedPath
          : `${req.scoreId}-${f.voiceId}-${Date.now()}-${index}-${f.fileName}`,
      };

      return this.#musicSheetService.create$(createRequest);
    });

    if (createCalls.length === 0) {
      return of([]);
    }

    return forkJoin(createCalls);
  }
}
