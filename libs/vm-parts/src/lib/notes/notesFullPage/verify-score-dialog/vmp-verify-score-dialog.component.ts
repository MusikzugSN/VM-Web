import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  PdfViewerComponent,
  PdfViewerModule,
  ToolbarSettingsModel,
} from '@syncfusion/ej2-angular-pdfviewer';
import {
  VmcInputField,
  VmcToolbar,
  VmFormField,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { DialogBase } from '@vm-utils/dialogs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MusicSheetService, ScoreService, VoiceService } from '@vm-utils/services';
import { of } from 'rxjs';

type StoredSelection = {
  scoreId?: number;
  voiceId?: number;
};

@Component({
  selector: 'vmp-verify-score-dialog.component',
  imports: [AsyncPipe, PdfViewerModule, VmcInputField, VmcToolbar],
  templateUrl: './vmp-verify-score-dialog.component.html',
  styleUrl: './vmp-verify-score-dialog.component.scss',
})
export class VmpVerifyScoreDialog extends DialogBase<boolean> {
  public readonly verifyViewer = viewChild<PdfViewerComponent>('viewer');
  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);
  readonly #musicSheetService = inject(MusicSheetService);

  readonly #scores = toSignal(this.#scoreService.load$(), { initialValue: [] });
  readonly #voices = toSignal(this.#voiceService.load$({ includeInstrumentName: true }), {
    initialValue: [],
  });

  readonly #selectedScoreId = signal<number | undefined>(undefined);
  readonly #selectedVoiceId = signal<number | undefined>(undefined);

  readonly #storageKey = 'verifyViewer.selection';

  documentPath$ = of(`vm-web://${musicSheetId}`);

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
      action: () => {},
    },
    {
      key: 'cancel',
      icon: 'close',
      label: 'Abbrechen',
      action: () => {},
    },
  ];
  scoreChanged(value: VmValidFormTypes): void {
    const nextScoreId = Number(value);
    if (Number.isNaN(nextScoreId)) {
      return;
    }

    this.#selectedScoreId.set(nextScoreId);
    this.#persistSelection();
  }

  voiceChanged(value: VmValidFormTypes): void {
    const nextVoiceId = Number(value);
    if (Number.isNaN(nextVoiceId)) {
      return;
    }

    this.#selectedVoiceId.set(nextVoiceId);
    this.#persistSelection();
  }
  onDocumentLoad(): void {
    this.#restoreSelection();
  }
  #persistSelection(): void {
    const payload: StoredSelection = {
      scoreId: this.#selectedScoreId(),
      voiceId: this.#selectedVoiceId(),
    };

    localStorage.setItem(this.#storageKey, JSON.stringify(payload));
  }
  #restoreSelection(): void {
    const raw = localStorage.getItem(this.#storageKey);
    if (!raw) {
      return;
    }

    let parsed: StoredSelection | undefined;
    try {
      parsed = JSON.parse(raw) as StoredSelection;
    } catch {
      return;
    }

    const scoreExists =
      parsed.scoreId !== undefined && this.#scores().some((s) => s.scoreId === parsed.scoreId);

    const voiceExists =
      parsed.voiceId !== undefined && this.#voices().some((v) => v.voiceId === parsed.voiceId);

    this.#selectedScoreId.set(scoreExists ? parsed.scoreId : undefined);
    this.#selectedVoiceId.set(voiceExists ? parsed.voiceId : undefined);
  }
}
