import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService {
  readonly #httpClient = inject(HttpClient);

  downloadFile(selectedIds?: number[]): Observable<HttpResponse<Blob>> {
    const ids = selectedIds ?? [];
    return this.#httpClient
      .post('print', { musicSheetIds: ids, marschbuch: false }, { responseType: 'text' })
      .pipe(
        switchMap((token) => {
          const normalizedToken = token.replace(/^"|"$/g, '');
          const params = new HttpParams().set('token', normalizedToken);
          return this.#httpClient.get('print/download', {
            observe: 'response',
            params,
            responseType: 'blob',
          });
        }),
      );
  }
}
