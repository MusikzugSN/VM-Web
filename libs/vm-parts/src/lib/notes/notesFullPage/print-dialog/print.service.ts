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

  // Neuer Endpunkt: POST /api/v1/print liefert jetzt eine Liste von URLs (pro angefragter MusicSheetId)
  createPrintUrl$(musicSheetIds: number[], marschbuch = false): Observable<string[]> {
    return this.#http.post<string[]>('print', { musicSheetIds, marschbuch });
  }

  // Neuer Endpunkt: POST /api/v1/print/create-download liefert einen einzelnen Download-Token (string)
  createDownloadUrl$(musicSheetIds: number[], asZip = true,  marschbuch = false): Observable<string> {
    // Antwort ist ein einfacher Token-String
    return this.#http.post(`print/create-download`, { musicSheetIds, marschbuch, asZip }, { responseType: 'text' }).pipe(
      map((token) => token.replace(/^"|"$/g, '')),
    );
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

  // Liefert die Rohbytes als Blob und setzt den MIME-Type anhand der Response-Header (z.B. application/zip oder application/pdf).
  downloadByToken$(downloadUrl: string) {
    return this.#config.config$.pipe(
      switchMap((config) => {
        const url = (config?.backedApiUrl ?? '') + downloadUrl;
        return this.#http.get(url, { responseType: 'blob', observe: 'response' as const });
      }),
      map((resp) => {
        const ct = resp.headers.get('content-type');
        const body = resp.body as Blob;
        if (ct && body && body.type !== ct) {
          return new Blob([body], { type: ct });
        }
        return body;
      }),
    );
  }
}
