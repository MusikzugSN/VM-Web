import { Component, computed, inject, signal, viewChild } from '@angular/core';
import {
  MagnificationService,
  NavigationService,
  PdfViewerComponent,
  PdfViewerModule,
  PrintService,
  ThumbnailViewService,
  ToolbarService,
  ToolbarSettingsModel,
} from '@syncfusion/ej2-angular-pdfviewer';
import {NotesViewerService} from './noteViewer.service';
import {AsyncPipe, Location} from '@angular/common';
import { NoteViewerSelectionService } from './note-viewer-selection.service';
import { firstValueFrom, map } from 'rxjs';
import {
  VmcInputField,
  VmcToolbar,
  VmFormField,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { VoiceService, ScoreService } from '@vm-utils/services';
import { toSignal } from '@angular/core/rxjs-interop';
import { SnackbarService } from '@vm-utils/snackbar';

type VoiceRange = { from: number; to?: number };

@Component({
  selector: 'vmp-note-viewer',
  imports: [PdfViewerModule, AsyncPipe, VmcInputField, VmcToolbar],
  providers: [
    ToolbarService,
    NavigationService,
    ThumbnailViewService,
    MagnificationService,
    PrintService,
    NotesViewerService,
  ],
  templateUrl: './vmp-note-viewer.component.html',
  styleUrl: './vmp-note-viewer.component.scss',
})
export class VmpNoteViewer {
  readonly #noteViewerService = inject(NotesViewerService);
  readonly #selection = inject(NoteViewerSelectionService);
  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);
  readonly #location = inject(Location);
  readonly #snackbar = inject(SnackbarService);
  public readonly viewer = viewChild<PdfViewerComponent>('viewer');

  serviceUrl$ = this.#noteViewerService.hostedUrl$;

  readonly #selectedScoreId = signal<number | undefined>(undefined);
  readonly #selectedVoiceId = signal<number | undefined>(undefined);
  readonly #activeVoiceId = signal<number | undefined>(undefined);

  readonly #currentPage = signal<number>(1);
  readonly #pageCount = signal<number>(1);

  readonly #voiceRanges = signal<Record<number, VoiceRange>>({});

  readonly #scores = toSignal(this.#scoreService.load$(), { initialValue: [] });
  readonly #voices = toSignal(this.#voiceService.load$({ includeInstrumentName: true }), {
    initialValue: [],
  });
  readonly #selectedFiles = toSignal(this.#selection.files$, { initialValue: [] });

  scoreField = computed<VmFormField>(() => {
    const options: VmSelectOption[] = this.#scores().map((s) => ({
      label: s.title,
      value: s.scoreId.toString(),
    }));

    return {
      key: 'scoreId',
      label: 'Stück',
      type: 'select',
      value: this.#selectedScoreId()?.toString() ?? '',
      options,
    };
  });

  voiceField = computed<VmFormField>(() => {
    const options: VmSelectOption[] = this.#voices().map((v) => ({
      label: `${v.instrumentName ?? ''} ${v.name}`.trim(),
      value: v.voiceId.toString(),
    }));

    return {
      key: 'voiceId',
      label: 'Stimme',
      type: 'select',
      value: this.#selectedVoiceId()?.toString() ?? '',
      options,
    };
  });

  toolbarItems: VmToolbarItem[] = [
    {
      key: 'save',
      icon: 'save',
      label: 'Speichern',
      action: () => this.saveSelection(),
    },
    {
      key: 'cancel',
      icon: 'close',
      label: 'Abbrechen',
      action: () => this.cancel(),
    },
  ];

  rangesForSave = computed(() =>
    Object.entries(this.#voiceRanges())
      .map(([voiceId, r]) => ({ voiceId: Number(voiceId), fromPage: r.from, toPage: r.to }))
      .sort((a, b) => a.fromPage - b.fromPage),
  );

  onPageChange(args: { currentPageNumber?: number; currentPage?: number }): void {
    const page =
      Number(
        args?.currentPageNumber ?? args?.currentPage ?? this.viewer()?.currentPageNumber ?? 1,
      ) || 1;
    this.#currentPage.set(page);
  }

  customToolbar: ToolbarSettingsModel = {
    showTooltip: true,
    toolbarItems: [
      'DownloadOption',
      'PrintOption',
      'MagnificationTool',
      'PageNavigationTool',
      'OpenOption',
    ],
  };
  documentPath$ = this.#selection.files$.pipe(
    map((files) => {
      const first = files[0]?.file;
      return first ? URL.createObjectURL(first) : '';
    }),
  );
  onDocumentLoad(): void {
    const viewer = this.viewer();
    if (!viewer) return;

    this.#currentPage.set(viewer.currentPageNumber ?? 1);
    this.#pageCount.set(viewer.pageCount ?? 1);
  }

  voiceChanged(value: VmValidFormTypes): void {
    const nextVoiceId = Number(value);
    if (Number.isNaN(nextVoiceId)) {
      return;
    }

    const page = this.#currentPage();
    const previousVoiceId = this.#activeVoiceId();
    const ranges = { ...this.#voiceRanges() };

    if (previousVoiceId !== undefined && previousVoiceId !== nextVoiceId) {
      const prev = ranges[previousVoiceId];
      if (prev) {
        prev.to = Math.max(prev.from, page - 1);
      }
    }

    if (!ranges[nextVoiceId]) {
      ranges[nextVoiceId] = { from: page };
    }

    this.#voiceRanges.set(ranges);
    this.#activeVoiceId.set(nextVoiceId);
    this.#selectedVoiceId.set(nextVoiceId);
  }

   async saveSelection(): Promise<void> {
     const scoreId = this.#selectedScoreId();
     const files = this.#selectedFiles();
     const firstFile = files[0]?.file;

     if (!scoreId) {
       this.#snackbar.raiseError('Bitte zuerst ein Stück auswählen.');
       return;
     }

     if (!firstFile) {
       this.#snackbar.raiseError('Keine PDF-Datei im Viewer gefunden.');
       return;
     }

     const activeVoiceId = this.#activeVoiceId();
     const ranges = { ...this.#voiceRanges() };

     // letzte offene Stimme bis Dokumentende schließen
     if (activeVoiceId !== undefined && ranges[activeVoiceId] && ranges[activeVoiceId].to === undefined) {
       ranges[activeVoiceId].to = this.#pageCount();
     }

     const payload = Object.entries(ranges)
       .map(([voiceId, r]) => ({
         voiceId: Number(voiceId),
         fromPage: r.from,
         toPage: r.to,
       }))
       .filter((x) => x.toPage !== undefined && x.fromPage <= (x.toPage as number))
       .map((x) => ({
         voiceId: x.voiceId,
         fromPage: x.fromPage,
         toPage: x.toPage as number,
       }));

     if (payload.length === 0) {
       this.#snackbar.raiseError('Keine gültigen Stimmenbereiche definiert.');
       return;
     }

     await firstValueFrom(
       this.#noteViewerService.cropPdfByVoices$({
         scoreId,
         file: firstFile,
         ranges: payload,
       }),
     );

     this.#snackbar.raiseSuccess('Stimmenbereiche wurden an das Backend übertragen.');
   }

  scoreChanged(value: VmValidFormTypes): void {
    const parsed = Number(value);
    this.#selectedScoreId.set(Number.isNaN(parsed) ? undefined : parsed);
  }

  cancel(): void {
    this.#location.back();
  }
}
