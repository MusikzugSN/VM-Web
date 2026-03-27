import { map, Observable } from 'rxjs';
import {inject, Injectable} from '@angular/core';
import { ConfigService } from '@vm-utils';

@Injectable({
  providedIn: 'root'
})
export class NotesViewerService {
  readonly #config = inject(ConfigService);

  hostedUrl$: Observable<string> = this.#config.config$.pipe(
    map((x) => x?.backedApiUrl + '/PdfViewer'),
  );
}
