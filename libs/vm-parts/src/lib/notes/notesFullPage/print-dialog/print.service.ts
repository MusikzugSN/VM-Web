import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable ({
  providedIn: 'root'
})
export class PrintService {
  private readonly API_URL = 'http://127.0.0.1:1913/api';

  http = inject(HttpClient);

  getPrinters$(): Observable<Printer[]> {
    return this.http.get<Printer[]>(`${this.API_URL}/printers`);
  }

  printFiles(printerName: string, files: { url: string; filename: string }[]): Observable<PrintResponse> {
    const payload = {
      printer: printerName,
      files: files
    };
    return this.http.post<PrintResponse>(`${this.API_URL}/print`, payload);
  }


}
