import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import {Folder, FoldersService, MusicSheet, MusicSheetService} from '@vm-utils/services';
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
  readonly #musicSheetService = inject(MusicSheetService);
  readonly #scoreService = inject(ScoreService);
  readonly #unverifiedDataDialogService = inject(UnverifiedDialogService);
  readonly #foldersService = inject(FoldersService);

  #reload = new BehaviorSubject(false);

  sheet$: Observable<MusicSheet[]> = this.#reload.pipe(
    switchMap((_x) => this.#musicSheetService.load$().pipe(catchError(() => of([])))),
  );
  score$: Observable<Score[]> = this.#reload.pipe(
    switchMap((_x) => this.#scoreService.load$().pipe(catchError(() => of([])))),
  );

  folder$: Observable<Folder[]> = this.#reload.pipe(
    switchMap((_x) => this.#foldersService.load$().pipe(catchError(() => of([])))),
  );

  async execAction(action: VmRowClickedEvent<Score>): Promise<void> {
    if (action.key === 'edit') {
      if (action.rowData === null) return;
      const reload = await this.#unverifiedDataDialogService.openEditScoreDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      if (action.rowData === null) return;
      const reload = await this.#unverifiedDataDialogService.openDeleteScoreDialog(action.rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  data$: Observable<AllNotesData[]> = combineLatest([this.sheet$, this.score$, this.folder$]).pipe(
    map(([sheet, score, folders]) => {
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
            folders: currentScore.musicFolders
              .map((z) => {
                const folder = folders.find(x => x.musicFolderId === z.musicFolderId);
                if (folder === undefined) {
                  return;
                }

                return folder.name + '(' + z.number + ')';
              })
              .filter(x => !!x)
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
