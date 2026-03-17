
import {map, Observable} from 'rxjs';
import {inject} from '@angular/core';
import {ConfigService} from '@vm-utils';

export class NotesViewerSerice {
  readonly #config = inject(ConfigService);
  hostedUrl$: Observable<string> = this.#config.config$.pipe(map(x => x?.backedApiUrl + '/PdfViewer'));
}
