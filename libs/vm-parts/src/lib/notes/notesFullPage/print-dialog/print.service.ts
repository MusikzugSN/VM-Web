import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable ({
  providedIn: 'root'
})
export class PrintService {
  readonly #http = inject(HttpClient);

  createPrintUrl$(musicSheetIds: number[], marschbuch = false): Observable<string> {
    return this.#http
      .post('print', { musicSheetIds, marschbuch }, { responseType: 'text' })
      .pipe(map((token) => token.replace(/^"|"$/g, '')));
  }

  downloadByToken$(token: string): Observable<Blob> {
    const params = new HttpParams().set('token', token);
    return this.#http.get('print/download', { params, responseType: 'blob' });
  }


}
