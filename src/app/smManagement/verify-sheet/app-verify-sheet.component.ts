import { Component, computed, inject } from '@angular/core';
import {
  MagnificationService,
  NavigationService,
  PdfViewerModule,
  PrintService,
  ThumbnailViewService,
  ToolbarService,
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
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MusicSheet,
  MusicSheetService,
  MusicSheetStatus,
  NotesViewerService,
  ScoreService,
  VerifySheetService,
  VoiceService,
} from '@vm-utils/services';
import { AsyncPipe, Location } from '@angular/common';
import { filter, firstValueFrom, map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'vmp-verify-score-dialog',
  imports: [PdfViewerModule, VmcInputField, VmcToolbar, AsyncPipe],
  providers: [
    ToolbarService,
    NavigationService,
    ThumbnailViewService,
    MagnificationService,
    PrintService,
  ],
  templateUrl: './app-verify-sheet.component.html',
  styleUrl: './app-verify-sheet.component.scss',
})
export class AppVerifySheet {
  readonly #noteViewerService = inject(NotesViewerService);
  readonly #scoreService = inject(ScoreService);
  readonly #voiceService = inject(VoiceService);
  readonly #musicSheetService = inject(MusicSheetService);
  readonly #verifySheetService = inject(VerifySheetService);
  readonly #location = inject(Location);

  #sheetIdsToCheck$ = this.#verifySheetService.sheetsIds$;
  #sheetId$ = this.#sheetIdsToCheck$.pipe(map((x) => x[0]));
  #sheet$ = this.#sheetId$.pipe(
    filter((x) => x !== undefined),
    switchMap((x) => this.#musicSheetService.loadById$(x)),
  );

  serviceUrl$ = this.#noteViewerService.hostedUrl$;

  documentPath$ = this.#sheetId$.pipe(map((x) => `vm-web://${x}`));
  //Component anlegen, query nutzen

  readonly #scores = toSignal(this.#scoreService.load$(), { initialValue: [] });
  readonly #voices = toSignal(this.#voiceService.load$({ includeInstrumentName: true }), {
    initialValue: [],
  });

  readonly #selectedScoreId = toSignal(this.#sheet$.pipe(map((x) => x.scoreId)));
  readonly #selectedVoiceId = toSignal(this.#sheet$.pipe(map((x) => x.voiceId)));

  customToolbar: ToolbarSettingsModel = {
    showTooltip: true,
    toolbarItems: ['MagnificationTool', 'PageNavigationTool'],
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
      key: 'cancel',
      icon: 'close',
      label: 'Abbrechen',
      action: (): void => this.cancel(),
    },
    {
      key: 'reject',
      icon: 'cancel',
      label: 'Ablehnen und weiter',
      action: async (): Promise<void> => {
        await firstValueFrom(this.setStatus$(MusicSheetStatus.Rejected));
        await this.nextSheet();
      },
    },
    {
      key: 'accept',
      icon: 'check_circle_outline',
      label: 'Annehmen und weiter',
      action: async (): Promise<void> => {
        await firstValueFrom(this.setStatus$(MusicSheetStatus.Accepted));
        await this.nextSheet();
      },
    },
  ];

  changedScoreId: number | undefined = undefined;
  changedVoiceId: number | undefined = undefined;

  scoreChanged(value: VmValidFormTypes): void {
    this.changedScoreId = Number(value);
  }

  voiceChanged(value: VmValidFormTypes): void {
    this.changedVoiceId = Number(value);
  }

  setStatus$(status: MusicSheetStatus): Observable<MusicSheet> {
    return this.#sheetId$.pipe(
      filter((x) => x !== undefined),
      switchMap((x) =>
        this.#musicSheetService.setStatusToMusicSheet$(
          x,
          status,
          this.changedScoreId,
          this.changedVoiceId,
        ),
      ),
    );
  }

  async nextSheet() {
    const currentSheetId = await firstValueFrom(this.#sheetId$);
    if (!currentSheetId) return;

    const sheetIds = await firstValueFrom(this.#sheetIdsToCheck$);

    if (sheetIds.length < 2) this.cancel();

    this.changedScoreId = undefined;
    this.changedVoiceId = undefined;

    this.#verifySheetService.removeId(currentSheetId);
  }

  cancel(): void {
    this.#location.back();
  }
}
