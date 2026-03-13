import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import { MusicSheet, MusicSheetService, Score, ScoreService, Voice, VoiceService } from '@vm-utils/services';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { UnverifiedDialogService } from './unverified-dialog.service';

@Component({
  selector: 'app-unverified',
  imports: [VmpNotesFullPageComponent, AsyncPipe],
  templateUrl: './app-unverified.component.html',
  styleUrl: './app-unverified.component.scss',
})
export class AppUnverifiedComponent {
  readonly #MusicSheetService = inject(MusicSheetService);
  readonly #ScoreService = inject(ScoreService);
  readonly #VoiceService = inject(VoiceService);
  readonly #unverifiedDialogService = inject(UnverifiedDialogService);

  #reload = new BehaviorSubject(false);

  score$: Observable<Score[]> = this.#reload.pipe(switchMap(() => this.#ScoreService.load$()));
  voice$: Observable<Voice[]> = this.#reload.pipe(
    switchMap(() => this.#VoiceService.load$({ includeInstrumentName: true })),
  );

  sheet$: Observable<MusicSheet[]> = this.#reload.pipe(
    switchMap(() => combineLatest([
      this.#ScoreService.load$(),
      this.#VoiceService.load$({ includeInstrumentName: true }),
    ])),
    switchMap(([scores, voices]) => {
      const requests = scores.flatMap(score =>
        voices.map(voice =>
          this.#MusicSheetService.loadByScoreAndVoice$(score.scoreId, voice.voiceId).pipe(
            catchError(() => of([])),
          ),
        ),
      );

      if (requests.length === 0) {
        return of([]);
      }

      return forkJoin(requests).pipe(
        map((responses) => {
          const unique = new Map<number, MusicSheet>();
          responses.flat().forEach((entry) => unique.set(entry.musicSheetId, entry));
          return Array.from(unique.values());
        }),
      );
    }),
  );

  data$: Observable<AllNotesData[]> = combineLatest([this.sheet$, this.score$, this.voice$]).pipe(
    map(([sheet, score, voices]) => {
      return sheet
        .map((x) => {
          const currentScore = score.find((y) => y.scoreId === x.scoreId);
          if (!currentScore) {
            return undefined; //todo far: fehlerbehandlung
          }

          const fallbackVoice = voices.find(v => v.voiceId === x.voiceId);
          const resolvedVoiceName = (x.voiceName ?? '').trim().length > 0
            ? x.voiceName
            : [fallbackVoice?.instrumentName, fallbackVoice?.name].filter(Boolean).join(' ').trim();
          const voiceName = resolvedVoiceName.length > 0 ? resolvedVoiceName : `Stimme ${x.voiceId}`;

          return {
            notesId: x.musicSheetId,
            scoreId: x.scoreId,
            voiceId: x.voiceId,
            name: currentScore.title,
            composer: currentScore.composer,
            folders: (currentScore.folders ?? [])
              .map((z) => `${z.musicFolderName} (${z.number})`)
              .join(', '),
            link: currentScore.link,
            pageCount: x.pageCount,
            voiceName,
          } as AllNotesData;
        })
        .filter((x) => x !== undefined);
    }),
  );

  reloadData(): void {
    this.#reload.next(true);
  }

  async deleteEntry(entry: AllNotesData): Promise<void> {
    const reload = await this.#unverifiedDialogService.openDeleteMusicSheetDialog({
      musicSheetId: entry.notesId,
      name: entry.name,
    });

    if (reload) {
      this.reloadData();
    }
  }

  async editEntry(entry: AllNotesData): Promise<void> {
    if (!entry.voiceId || !entry.scoreId) {
      return;
    }

    const reload = await this.#unverifiedDialogService.openEditMusicSheetDialog({
      musicSheetId: entry.notesId,
      scoreId: entry.scoreId,
      name: entry.name,
      composer: entry.composer,
      voiceId: entry.voiceId,
    });

    if (reload) {
      this.reloadData();
    }
  }
}
