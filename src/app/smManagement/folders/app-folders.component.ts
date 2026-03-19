import { Component, inject} from '@angular/core';
import {
  Folder,
  FoldersService,
  MusicSheet,
  MusicSheetQuerys,
  MusicSheetService, Score,
  ScoreService,
  VoiceService
} from '@vm-utils/services';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable, of,
  switchMap
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import {AsyncPipe} from '@angular/common';
import {UnverifiedDialogService} from '../unverified/unverified-dialog.service';
import {VmRowClickedEvent} from '@vm-components';

@Component({
  selector: 'app-folders.component',
  imports: [VmpNotesFullPageComponent, AsyncPipe],
  templateUrl: './app-folders.component.html',
  styleUrl: './app-folders.component.scss',
})
export class AppFolderScoreComponent {
  readonly #musicSheetService = inject(MusicSheetService);
  readonly #scoreService = inject(ScoreService);
  readonly #unverifiedDataDialogService = inject(UnverifiedDialogService);
  readonly #foldersService = inject(FoldersService);
  readonly #voiceService = inject(VoiceService);

  readonly #route = inject(ActivatedRoute);

  #folderId = this.#route.paramMap
    .pipe(
      map((params) => params.get('folderId')),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    );

  #reload = new BehaviorSubject(false);
  #voiceFilter = new BehaviorSubject<number | undefined>(undefined);

  sheet$: Observable<MusicSheet[]> = combineLatest([this.#folderId, this.#reload, this.#voiceFilter]).pipe(
    switchMap(([folderId, _x, filter]) => {
      if (folderId === null) {
        return [];
      }

      let queryParam: MusicSheetQuerys | undefined = undefined;

      if (filter) {
        queryParam = { voiceIds: [filter]}
      }

      return this.#musicSheetService.loadForFolder$(folderId, queryParam).pipe(catchError(() => of([])))
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
