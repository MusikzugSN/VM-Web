import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Printer {
  name: string;
  is_default: boolean;
}

export interface PrintResponse {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private readonly API_URL = 'http://127.0.0.1:1913/api';
  readonly #http = inject(HttpClient);

  getPrinters$(): Observable<Printer[]> {
    return this.#http.get<Printer[]>(`${this.API_URL}/printers`);
  }

  createPrintUrl$(musicSheetIds: number[], marschbuch = false): Observable<string> {
    return this.#http
      .post(`${this.API_URL}/print`, { musicSheetIds, marschbuch }, { responseType: 'text' })
      .pipe(map((token) => token.replace(/^"|"$/g, '')));
  }

  printFiles(
    printerName: string,
    files: { url: string; filename: string }[],
  ): Observable<PrintResponse> {
    const payload = {
      printer: printerName,
      files,
    };
    return this.#http.post<PrintResponse>(`${this.API_URL}/print`, payload);
  }

  downloadByToken$(token: string): Observable<string> {
    const params = new HttpParams().set('token', token);
    return this.#http.get<string>(`${this.API_URL}/print/download`, {
      params,
    });
  }
}
