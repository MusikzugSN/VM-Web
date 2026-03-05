import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService {
  readonly #httpClient = inject(HttpClient);

  downloadFile(selectedIds?: number[]): Observable<HttpResponse<Blob>> {
    let params = new HttpParams();
    if (selectedIds && selectedIds.length > 0) {
      params = params.set('ids', selectedIds.join(','));
    }
    return this.#httpClient.get<Blob>('placeholder', { observe: 'response', params });
  }
}
