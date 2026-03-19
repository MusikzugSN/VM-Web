import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import {
  Folder,
  FoldersService,
  MusicSheet,
  MusicSheetQuerys,
  MusicSheetService,
  VoiceService
} from '@vm-utils/services';
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
  readonly #voiceService = inject(VoiceService);

  #reload = new BehaviorSubject(false);
  #voiceFilter = new BehaviorSubject<number | undefined>(undefined);

  sheet$: Observable<MusicSheet[]> = combineLatest([this.#reload, this.#voiceFilter]).pipe(
    switchMap(([_x, filter]) => {
      let queryParam: MusicSheetQuerys | undefined = undefined;

      if (filter) {
        queryParam = { voiceIds: [filter]}
      }

      return this.#musicSheetService.loadForUnverifieed$(queryParam).pipe(catchError(() => of([])))
    }),
  );
  score$: Observable<Score[]> = this.#reload.pipe(
    switchMap((_x) => this.#scoreService.load$({ includeMusicFolders: true }).pipe(catchError(() => of([])))),
  );

  folders$: Observable<Folder[]> = this.#reload.pipe(
    switchMap((_x) => this.#foldersService.load$().pipe(catchError(() => of([])))),
  );

  voices$ = this.#reload.pipe(
    switchMap(_x => this.#voiceService.load$({ includeInstrumentName: true }).pipe(catchError(() => of([])))),
  )

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

  data$: Observable<AllNotesData[]> = combineLatest([this.sheet$, this.score$, this.folders$, this.voices$]).pipe(
    map(([sheet, score, folders, voices]) => {
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
                //console.log('for ' + x.musicSheetId, currentScore.composer, currentScore.musicFolders)
                if (folder === undefined) {
                  return;
                }

                return folder.name + (z.number.trim().length > 0 ? ' (' + z.number + ')' : '');
              })
              .filter(x => !!x)
              .join(', '),
            link: currentScore.link,
            pageCount: x.pageCount,
            voice: voices
              .filter(voice => voice.voiceId === x.voiceId)
              .map(voice => voice.instrumentName + ' ' + voice.name).join(', '),
          } as AllNotesData;
        })
        .filter((x) => x !== undefined);
    }),
  );

  voiceFilterChanged(event: number) {
    this.#voiceFilter.next(event);
  }
}
