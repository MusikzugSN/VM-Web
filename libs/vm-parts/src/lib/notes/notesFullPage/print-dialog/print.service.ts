import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '@vm-utils/services';

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

export interface PrintServiceHealth {
  status: string;
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private readonly API_URL = 'http://127.0.0.1:1913/api';
  readonly #http = inject(HttpClient);
  readonly #config = inject(ConfigService);

  health$(): Observable<PrintServiceHealth> {
    return this.#http.get<PrintServiceHealth>(`${this.API_URL}/health`);
  }

  getPrinters$(): Observable<Printer[]> {
    return this.#http.get<Printer[]>(`${this.API_URL}/printers`);
  }

  createPrintUrl$(musicSheetIds: number[], marschbuch = false): Observable<string> {
    return this.#http
      .post('print', { musicSheetIds, marschbuch }, { responseType: 'text' })
      .pipe(map((token) => token.replace(/^"|"$/g, '')));
  }

  printFiles$(
    printerName: string,
    files: { url: string; filename: string }[],
  ): Observable<PrintResponse> {
    const payload = {
      printer: printerName,
      files,
    };

    return this.#http.post<PrintResponse>(`${this.API_URL}/print`, payload);
  }

  downloadByToken$(downloadUrl: string): Observable<string> {
    return this.#config.config$.pipe(
      switchMap((config) => {
        return this.#http.get<string>(config?.backedApiUrl + downloadUrl);
      }),
    );
  }
}
