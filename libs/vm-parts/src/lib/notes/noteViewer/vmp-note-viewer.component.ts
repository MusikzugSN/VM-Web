import {Component, inject} from '@angular/core';
import {
  MagnificationService,
  NavigationService,
  PdfViewerModule,
  PrintService,
  ThumbnailViewService,
  ToolbarService,
  ToolbarSettingsModel
} from '@syncfusion/ej2-angular-pdfviewer';
import {NotesViewerSerice} from './noteViewer.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'vmp-note-viewer',
  imports: [
    PdfViewerModule,
    AsyncPipe
  ],
  providers: [
    ToolbarService,
    NavigationService,
    ThumbnailViewService,
    MagnificationService,
    PrintService,
    NotesViewerSerice
  ],
  templateUrl: './vmp-note-viewer.component.html',
  styleUrl: './vmp-note-viewer.component.scss',
})
export class VmpNoteViewer {
  readonly #noteViewerService = inject(NotesViewerSerice);
  serviceUrl$ = this.#noteViewerService.hostedUrl$;
  customToolbar: ToolbarSettingsModel = {
    showTooltip: true,
    toolbarItems: [
      'DownloadOption',
      'PrintOption',
      'MagnificationTool',
      'PageNavigationTool',
      'OpenOption'
    ],
  }
}
