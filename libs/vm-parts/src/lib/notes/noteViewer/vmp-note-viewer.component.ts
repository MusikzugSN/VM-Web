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
import { NotesViewerService, ScoreVoiceRangesDTO } from './noteViewer.service';
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

  readonly #voiceRangesByScore = signal<Record<number, Record<number, PageRange[]>>>({});

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
    this.#syncFieldsToCurrentPage(page);
  }

  onDocumentLoad(): void {
    const viewer = this.viewer();
    if (!viewer) {
      return;
    }

    this.#currentPage.set(viewer.currentPageNumber ?? 1);

    this.#selectedScoreId.set(undefined);
    this.#selectedVoiceId.set(undefined);
    this.#activeScoreId.set(undefined);
    this.#activeVoiceId.set(undefined);
    this.#voiceRangesByScore.set({});
  }

  scoreChanged(value: VmValidFormTypes): void {
    const nextScoreId = Number(value);
    if (Number.isNaN(nextScoreId)) {
      return;
    }

    const page = this.#currentPage();
    const previousScoreId = this.#activeScoreId();
    const activeVoiceId = this.#activeVoiceId();

    if (
      previousScoreId !== undefined &&
      previousScoreId !== nextScoreId &&
      activeVoiceId !== undefined
    ) {
      this.#closeOpenVoiceRange(previousScoreId, activeVoiceId, page - 1);
    }

    this.#activeScoreId.set(nextScoreId);
    this.#selectedScoreId.set(nextScoreId);

    if (activeVoiceId !== undefined) {
      this.#activeVoiceId.set(activeVoiceId);
      this.#selectedVoiceId.set(activeVoiceId);
    }
  }

  voiceChanged(value: VmValidFormTypes): void {
    const activeScoreId = this.#activeScoreId();
    if (activeScoreId === undefined) {
      this.#snackbar.raiseError('Bitte zuerst ein Stück auswählen.');
      return;
    }

    const nextVoiceId = Number(value);
    if (Number.isNaN(nextVoiceId)) {
      return;
    }

    const page = this.#currentPage();
    const previousVoiceId = this.#activeVoiceId();

    if (previousVoiceId !== undefined && previousVoiceId !== nextVoiceId) {
      this.#closeOpenVoiceRange(activeScoreId, previousVoiceId, page - 1);
    }

    if (previousVoiceId !== nextVoiceId) {
      this.#ensureVoiceRangeStarted(activeScoreId, nextVoiceId, page);
    }

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

    const currentPage = this.#currentPage();
    const activeScoreId = this.#activeScoreId();
    const activeVoiceId = this.#activeVoiceId();

    if (activeScoreId !== undefined && activeVoiceId !== undefined) {
      this.#closeOpenVoiceRange(activeScoreId, activeVoiceId, currentPage);
    }

    const voiceRangesMap = this.#voiceRangesByScore();

    const items: ScoreVoiceRangesDTO[] = Object.entries(voiceRangesMap).flatMap(
      ([scoreId, voices]) =>
        Object.entries(voices).flatMap(([voiceId, vRanges]) =>
          vRanges
            .filter((range) => range.to !== undefined && range.from <= (range.to as number))
            .map((range) => ({
              scoreId: Number(scoreId),
              voiceId: Number(voiceId),
              fromPage: range.from,
              toPage: range.to as number,
            })),
        ),
    );

    if (items.length === 0) {
      this.#snackbar.raiseError('Keine gültigen Stimmen-Bereiche definiert.');
      return;
    }

    await firstValueFrom(
      this.#noteViewerService.cropPdfByVoicesBatch$({
        file: firstFile,
        items,
      }),
    );

    this.#snackbar.raiseSuccess(`${items.length} Stimmen-Bereich(e) wurden übertragen.`);
  }

  cancel(): void {
    this.#location.back();
  }

  #syncFieldsToCurrentPage(page: number): void {
    const assignment = this.#findAssignmentForPage(page);
    if (!assignment) {
      return;
    }

    this.#activeScoreId.set(assignment.scoreId);
    this.#selectedScoreId.set(assignment.scoreId);
    this.#activeVoiceId.set(assignment.voiceId);
    this.#selectedVoiceId.set(assignment.voiceId);
  }

  #findAssignmentForPage(page: number): { scoreId: number; voiceId: number } | undefined {
    const all = this.#voiceRangesByScore();

    let best:
      | {
      scoreId: number;
      voiceId: number;
      from: number;
      to?: number;
    }
      | undefined;

    for (const [scoreIdRaw, voices] of Object.entries(all)) {
      const scoreId = Number(scoreIdRaw);

      for (const [voiceIdRaw, ranges] of Object.entries(voices)) {
        const voiceId = Number(voiceIdRaw);

        for (const range of ranges) {
          if (page < range.from) {
            continue;
          }

          if (range.to !== undefined && page > range.to) {
            continue;
          }

          if (!best || range.from >= best.from) {
            best = {
              scoreId,
              voiceId,
              from: range.from,
              to: range.to,
            };
          }
        }
      }
    }

    if (!best) {
      return undefined;
    }

    return { scoreId: best.scoreId, voiceId: best.voiceId };
  }

  #closeOpenVoiceRange(scoreId: number, voiceId: number, toPage: number): void {
    const all = { ...this.#voiceRangesByScore() };
    const scoreVoices = { ...(all[scoreId] ?? {}) };
    const ranges = [...(scoreVoices[voiceId] ?? [])];

    for (let i = ranges.length - 1; i >= 0; i--) {
      const current = ranges[i];
      if (!current) {
        continue;
      }

      if (current.to === undefined) {
        ranges[i] = {
          from: current.from,
          to: Math.max(current.from, toPage),
        };
        break;
      }
    }

    scoreVoices[voiceId] = ranges;
    all[scoreId] = scoreVoices;
    this.#voiceRangesByScore.set(all);
  }

  #startVoiceRange(scoreId: number, voiceId: number, fromPage: number): void {
    const all = { ...this.#voiceRangesByScore() };
    const scoreVoices = { ...(all[scoreId] ?? {}) };
    const ranges = [...(scoreVoices[voiceId] ?? [])];

    ranges.push({ from: fromPage });

    scoreVoices[voiceId] = ranges;
    all[scoreId] = scoreVoices;
    this.#voiceRangesByScore.set(all);
  }

  #ensureVoiceRangeStarted(scoreId: number, voiceId: number, fromPage: number): void {
    const all = this.#voiceRangesByScore();
    const scoreVoices = all[scoreId];
    const ranges = scoreVoices?.[voiceId] ?? [];

    const hasOpenRange = ranges.some((r) => r.to === undefined);
    if (hasOpenRange) {
      return;
    }

    const pageAlreadyCovered = ranges.some((r) => {
      if (fromPage < r.from) {
        return false;
      }

      if (r.to === undefined) {
        return true;
      }

      return fromPage <= r.to;
    });

    if (pageAlreadyCovered) {
      return;
    }

    this.#startVoiceRange(scoreId, voiceId, fromPage);
  }
}
