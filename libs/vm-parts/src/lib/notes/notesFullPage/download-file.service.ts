import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ConfigService } from '@vm-utils/services';
import { filter, map, Observable, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService {
  readonly #httpClient = inject(HttpClient);
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

  downloadFile(selectedIds?: number[]): Observable<HttpResponse<Blob>> {
    const ids = selectedIds ?? [];
    return this.#httpClient
      .post('print', { musicSheetIds: ids, marschbuch: false }, { responseType: 'text' })
      .pipe(
        switchMap((downloadPath) =>
          this.#configService.config$.pipe(
            filter((cfg) => !!cfg),
            take(1),
            map((cfg) => this.#buildAbsoluteUrl(downloadPath, cfg.backedApiUrl)),
          ),
        ),
        switchMap((downloadUrl) =>
          this.#httpClient.get(downloadUrl, { observe: 'response', responseType: 'blob' }),
        ),
      );
  }
}
