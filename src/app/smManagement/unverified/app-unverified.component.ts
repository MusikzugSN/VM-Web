import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import { MusicSheet, MusicSheetService} from '@vm-utils/services';
import { Score, ScoreService } from '@vm-utils/services';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { VmRowClickedEvent } from '@vm-components';
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
  readonly #UnverifiedDataDialogService = inject(UnverifiedDialogService);

  #reload = new BehaviorSubject(false);

  sheet$: Observable<MusicSheet[]> = this.#reload.pipe(
    switchMap((_x) => this.#MusicSheetService.load$().pipe(catchError(() => of([])))),
  );
  score$: Observable<Score[]> = this.#reload.pipe(
    switchMap((_x) => this.#ScoreService.load$().pipe(catchError(() => of([])))),
  );

  async execAction(action: VmRowClickedEvent<Score>): Promise<void> {
    if (action.key === 'edit') {
      if (action.rowData === null) return;
      const reload = await this.#UnverifiedDataDialogService.openEditScoreDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      if (action.rowData === null) return;
      const reload = await this.#UnverifiedDataDialogService.openDeleteScoreDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

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
            voiceId: x.voiceId,
          } as AllNotesData;
        })
        .filter((x) => x !== undefined);
    }),
  );

}
