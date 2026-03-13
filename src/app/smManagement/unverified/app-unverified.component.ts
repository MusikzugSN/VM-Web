import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import { MusicSheet } from '@vm-utils/services';
import { Score, ScoreService } from '@vm-utils/services';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-unverified',
  imports: [VmpNotesFullPageComponent, AsyncPipe],
  templateUrl: './app-unverified.component.html',
  styleUrl: './app-unverified.component.scss',
})
export class AppUnverifiedComponent {
  readonly #ScoreService = inject(ScoreService);

  #reload = new BehaviorSubject(false);

  // Das Backend bietet keinen GET-Endpunkt fuer /musicSheet ohne Parameter.
  // Deshalb hier kein direkter List-Call, um 405-Fehler zu vermeiden.
  sheet$: Observable<MusicSheet[]> = of([]);
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
            notesId: x.musicSheetId,
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

  reloadData(): void {
    this.#reload.next(true);
  }
}
