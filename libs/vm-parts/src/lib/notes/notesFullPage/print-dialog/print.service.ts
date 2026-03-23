import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, map, Observable, switchMap, take } from 'rxjs';
import { ConfigService } from '@vm-utils/services';

@Injectable ({
  providedIn: 'root'
})
export class PrintService {
  readonly #http = inject(HttpClient);
  readonly #configService = inject(ConfigService);

  #buildAbsoluteUrl(downloadPath: string, baseUrl: string): string {
    const normalizedPath = downloadPath.replace(/^"|"$/g, '').trim();
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      return normalizedPath;
    }

    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathWithSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${normalizedBase}${pathWithSlash}`;
  }

  createPrintDownloadUrl$(musicSheetIds: number[], marschbuch = false): Observable<string> {
    return this.#http
      .post('print', { musicSheetIds, marschbuch }, { responseType: 'text' })
      .pipe(
        switchMap((downloadPath) =>
          this.#configService.config$.pipe(
            filter((cfg) => !!cfg),
            take(1),
            map((cfg) => this.#buildAbsoluteUrl(downloadPath, cfg.backedApiUrl)),
          ),
        ),
      );
  }

  downloadByUrl$(downloadUrl: string): Observable<Blob> {
    return this.#http.get(downloadUrl, { responseType: 'blob' });
  }


}
