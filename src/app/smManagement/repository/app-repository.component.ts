import { Component, inject } from '@angular/core';

import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import { MusicSheet, MusicSheetService } from './musicSheet.service';
import { Score, ScoreService } from './score.service';

@Component({
  selector: 'app-repository.component',
  imports: [AsyncPipe, VmpNotesFullPageComponent],
  templateUrl: './app-repository.component.html',
  styleUrl: './app-repository.component.scss',
})
export class AppRepositoryComponent {
  readonly #MusicSheetService = inject(MusicSheetService);
  readonly #ScoreService = inject(ScoreService);

  #reload = new BehaviorSubject(false);

  sheet$: Observable<MusicSheet[]> = this.#reload.pipe(
    switchMap((_x) => this.#MusicSheetService.load$()),
  );
  score$: Observable<Score[]> = this.#reload.pipe(switchMap((_x) => this.#ScoreService.load$()));

  data$: Observable<AllNotesData[]> = combineLatest([this.sheet$, this.score$]).pipe(
    map(([sheet, score]) => {
      return sheet
        .map((x) => {
          const currentScore = score.find((y) => y.scoreId === x.scoreId);
          if (!currentScore) {
            return undefined; //todo far: fehlerbehandlung
          }
          return {
            name: currentScore.title,
            composer: currentScore.composer,
            folders: currentScore.folders
              .map((z) => `${z.musicFolderName} (${z.number})`)
              .join(', '),
            link: currentScore.link,
            pageCount: x.pageCount,
            voiceName: x.voiceName,
          } as AllNotesData;
        })
        .filter((x) => x !== undefined);
    }),
  );
}
