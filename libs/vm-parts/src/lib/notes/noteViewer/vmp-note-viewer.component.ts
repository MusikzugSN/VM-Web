import {Component, inject, viewChild} from '@angular/core';
import {
  AllowedInteraction, FreeTextSettings,
  MagnificationService,
  NavigationService,
  PdfViewerComponent,
  PdfViewerModule,
  PrintService,
  ThumbnailViewService,
  ToolbarService,
  AnnotationService,
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
    AnnotationService,
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
      {
        text: 'test',
        id: 'systemCall',
      },
      {
        text: 'Add XXX',
        id: 'addXXX',
        prefixIcon: 'e-icons e-edit'
      },
      'DownloadOption',
      'PrintOption',
      'MagnificationTool',
      'PageNavigationTool',
      'OpenOption'
    ],
    annotationToolbarItems: [
      'AnnotationDeleteTool',
      'FontSizeAnnotationTool'
    ],
  }

  readonly viewer = viewChild<PdfViewerComponent>('viewer');

  onToolbarClick(args: any) {
    if (args.item && args.item.id === 'addXXX') {
      this.addTextToPdf();
    }
  }

  addTextToPdf() {
    const __viewer = this.viewer();

    if (!__viewer) {
      console.log("PDF Viewer is not initialized yet.");
      return;
    }

    __viewer.annotation.addAnnotation("FreeText", {
      offset: { x: 100, y: 150 },
      pageNumber: __viewer.currentPageNumber,
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 1,
      borderStyle: 'Solid',
      author: 'System',
      fillColor: '#ffffff',
      fontSize: 14,
      width: 120,
      height: 30,
      fontColor: '#000000',
      fontFamily: 'Helvetica',
      defaultText: 'xxx',
      fontStyle: 1,
      textAlignment: 'Center',
      allowEditTextOnly: false,
      annotationSelectorSettings: {},
      minHeight: 10,
      minWidth: 10,
      maxHeight: 500,
      maxWidth: 500,
      isLock: false,
      customData: { type: 'custom-xxx' },
      allowedInteractions: [AllowedInteraction.Resize, AllowedInteraction.Select, AllowedInteraction.Move],
      isPrint: true,
      isReadonly: false,
      enableAutoFit: false,
      subject: 'CustomText'
    } as FreeTextSettings);
  }
}
