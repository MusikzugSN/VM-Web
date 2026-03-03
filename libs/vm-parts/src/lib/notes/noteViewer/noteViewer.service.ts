
import {Observable, of} from 'rxjs';

export class NotesViewerSerice {
  //readonly #config = inject(ConfigService);
  hostedUrl$: Observable<string> = of("https://ej2services.syncfusion.com/production/web-services/api/pdfviewer");  //this.#config.config$.pipe(map(x => x?.backedApiUrl + '/pdf/viewer'));
}
