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
import {
  NotesViewerService,
  ScorePageRangeDTO,
  ScoreVoicePageRangeDTO,
} from './noteViewer.service';
import { AsyncPipe, Location } from '@angular/common';
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

type PageRange = { from: number; to?: number };

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

  readonly #activeScoreId = signal<number | undefined>(undefined);
  readonly #activeVoiceId = signal<number | undefined>(undefined);

  readonly #currentPage = signal<number>(1);
  readonly #pageCount = signal<number>(1);

  // Score-Ranges getrennt
  readonly #scoreRanges = signal<Record<number, PageRange>>({});

  // Voice-Ranges getrennt, aber pro Score gruppiert
  readonly #voiceRangesByScore = signal<Record<number, Record<number, PageRange>>>({});

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

  onPageChange(args: { currentPageNumber?: number; currentPage?: number }): void {
    const page =
      Number(
        args?.currentPageNumber ?? args?.currentPage ?? this.viewer()?.currentPageNumber ?? 1,
      ) || 1;
    this.#currentPage.set(page);
  }

  onDocumentLoad(): void {
    const viewer = this.viewer();
    if (!viewer) return;

    this.#currentPage.set(viewer.currentPageNumber ?? 1);
    this.#pageCount.set(viewer.pageCount ?? 1);

    this.#selectedScoreId.set(undefined);
    this.#selectedVoiceId.set(undefined);
    this.#activeScoreId.set(undefined);
    this.#activeVoiceId.set(undefined);
    this.#scoreRanges.set({});
    this.#voiceRangesByScore.set({});
  }

  scoreChanged(value: VmValidFormTypes): void {
    const nextScoreId = Number(value);
    if (Number.isNaN(nextScoreId)) {
      return;
    }

    const page = this.#currentPage();
    const previousScoreId = this.#activeScoreId();
    const ranges = { ...this.#scoreRanges() };

    if (previousScoreId !== undefined && previousScoreId !== nextScoreId) {
      const prev = ranges[previousScoreId];
      if (prev) {
        prev.to = Math.max(prev.from, page - 1);
      }
    }

    if (!ranges[nextScoreId]) {
      ranges[nextScoreId] = { from: page };
    }

    this.#scoreRanges.set(ranges);
    this.#activeScoreId.set(nextScoreId);
    this.#selectedScoreId.set(nextScoreId);

    // Stimme beim Stückwechsel neu starten
    this.#activeVoiceId.set(undefined);
    this.#selectedVoiceId.set(undefined);
  }

  voiceChanged(value: VmValidFormTypes): void {
    const activeScoreId = this.#activeScoreId();
    if (!activeScoreId) {
      this.#snackbar.raiseError('Bitte zuerst ein Stück auswählen.');
      return;
    }

    const nextVoiceId = Number(value);
    if (Number.isNaN(nextVoiceId)) {
      return;
    }

    const page = this.#currentPage();
    const previousVoiceId = this.#activeVoiceId();

    const all = { ...this.#voiceRangesByScore() };
    const voicesInActiveScore = { ...(all[activeScoreId] ?? {}) };

    if (previousVoiceId !== undefined && previousVoiceId !== nextVoiceId) {
      const prev = voicesInActiveScore[previousVoiceId];
      if (prev) {
        prev.to = Math.max(prev.from, page - 1);
      }
    }

    if (!voicesInActiveScore[nextVoiceId]) {
      voicesInActiveScore[nextVoiceId] = { from: page };
    }

    all[activeScoreId] = voicesInActiveScore;
    this.#voiceRangesByScore.set(all);
    this.#activeVoiceId.set(nextVoiceId);
    this.#selectedVoiceId.set(nextVoiceId);
  }

  async saveSelection(): Promise<void> {
    const files = this.#selectedFiles();
    const firstFile = files[0]?.file;

    if (!firstFile) {
      this.#snackbar.raiseError('Keine PDF-Datei im Viewer gefunden.');
      return;
    }

    const pageCount = this.#pageCount();

    // Offene Score-Range schließen
    const scoreRangesMap = { ...this.#scoreRanges() };
    const activeScoreId = this.#activeScoreId();
    if (
      activeScoreId !== undefined &&
      scoreRangesMap[activeScoreId] &&
      scoreRangesMap[activeScoreId].to === undefined
    ) {
      scoreRangesMap[activeScoreId].to = pageCount;
    }

    // Offene Voice-Range schließen
    const voiceRangesMap = { ...this.#voiceRangesByScore() };
    const activeVoiceId = this.#activeVoiceId();
    if (activeScoreId !== undefined && activeVoiceId !== undefined) {
      const voices = { ...(voiceRangesMap[activeScoreId] ?? {}) };
      if (voices[activeVoiceId] && voices[activeVoiceId].to === undefined) {
        voices[activeVoiceId].to = pageCount;
      }
      voiceRangesMap[activeScoreId] = voices;
    }

    this.#scoreRanges.set(scoreRangesMap);
    this.#voiceRangesByScore.set(voiceRangesMap);

    const scoreRanges: ScorePageRangeDTO[] = Object.entries(scoreRangesMap)
      .map(([scoreId, range]) => ({
        scoreId: Number(scoreId),
        fromPage: range.from,
        toPage: range.to,
      }))
      .filter((x) => x.toPage !== undefined && x.fromPage <= (x.toPage as number))
      .map((x) => ({
        scoreId: x.scoreId,
        fromPage: x.fromPage,
        toPage: x.toPage as number,
      }));

    const voiceRanges: ScoreVoicePageRangeDTO[] = Object.entries(voiceRangesMap)
      .flatMap(([scoreId, voices]) =>
        Object.entries(voices).map(([voiceId, range]) => ({
          scoreId: Number(scoreId),
          voiceId: Number(voiceId),
          fromPage: range.from,
          toPage: range.to,
        })),
      )
      .filter((x) => x.toPage !== undefined && x.fromPage <= (x.toPage as number))
      .map((x) => ({
        scoreId: x.scoreId,
        voiceId: x.voiceId,
        fromPage: x.fromPage,
        toPage: x.toPage as number,
      }));

    if (scoreRanges.length === 0 && voiceRanges.length === 0) {
      this.#snackbar.raiseError('Keine gültigen Bereiche definiert.');
      return;
    }

    await firstValueFrom(
      this.#noteViewerService.cropPdfByScoreVoices$({
        file: firstFile,
        scoreRanges,
        voiceRanges,
      }),
    );

    this.#snackbar.raiseSuccess('Score- und Stimmenbereiche wurden übertragen.');
  }

  cancel(): void {
    this.#location.back();
  }
}
