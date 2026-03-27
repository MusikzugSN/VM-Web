import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmRowClickedEvent } from '@vm-components';
import { AllNotesData, VmpNotesFullPageComponent } from '@vm-parts';
import {
  AuthService,
  Folder,
  FoldersService,
  MusicSheet,
  MusicSheetQuerys,
  MusicSheetService,
  Score,
  ScoreService,
  VoiceService,
} from '@vm-utils/services';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
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
  readonly #authService = inject(AuthService);
  readonly #destroyRef = inject(DestroyRef);

  readonly #voiceFilterCookiePrefix = 'unverified-voice-filter';

  #reload = new BehaviorSubject(false);
  #voiceFilter = new BehaviorSubject<number[] | undefined>(undefined);
  #currentUserId: string | undefined;

  voiceFilter$: Observable<number[]> = this.#voiceFilter.pipe(map((ids) => ids ?? []));

  readonly #userId$ = this.#authService.myInformation$.pipe(
    map((info) => {
      if (!info) {
        return undefined;
      }

      // Backend nimmt id oder userId
      const rawUserId =
        (info as { id?: string | number; userId?: string | number; user_id?: string | number }).id ??
        (info as { userId?: string | number }).userId ??
        (info as { user_id?: string | number }).user_id;

      if (rawUserId === undefined || rawUserId === null) {
        return undefined;
      }

      return String(rawUserId);
    }),
    filter((id): id is string => !!id),
  );

  constructor() {
    this.#userId$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((userId) => {
      this.#currentUserId = userId;
    });

    // Restore directly per user; do not depend on voice loading to avoid accidental reset.
    this.#userId$
      .pipe(take(1), takeUntilDestroyed(this.#destroyRef))
      .subscribe((userId) => this.#restoreVoiceFilter(userId));
  }

  sheet$: Observable<MusicSheet[]> = combineLatest([this.#reload, this.voiceFilter$]).pipe(
    switchMap(([_x, filterIds]) => {
      let queryParam: MusicSheetQuerys | undefined = undefined;

      if (filterIds.length > 0) {
        queryParam = { voiceIds: filterIds };
      }

      return this.#musicSheetService.loadForUnverifieed$(queryParam).pipe(catchError(() => of([])));
    }),
  );

  score$: Observable<Score[]> = this.#reload.pipe(
    switchMap(() => this.#scoreService.load$({ includeMusicFolders: true }).pipe(catchError(() => of([])))),
  );

  folders$: Observable<Folder[]> = this.#reload.pipe(
    switchMap(() => this.#foldersService.load$().pipe(catchError(() => of([])))),
  );

  voices$ = this.#reload.pipe(
    switchMap(() => this.#voiceService.load$({ includeInstrumentName: true }).pipe(catchError(() => of([])))),
  );

  async execAction(action: VmRowClickedEvent<AllNotesData>): Promise<void> {
    if (action.rowData === null) {
      return;
    }

    if (action.key === 'delete') {
      const reload = await this.#unverifiedDataDialogService.openDeleteScoreDialog({
        note: action.rowData,
      });
      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  data$: Observable<AllNotesData[]> = combineLatest([
    this.sheet$,
    this.score$,
    this.folders$,
    this.voices$,
  ]).pipe(
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
                const folder = folders.find((folderItem) => folderItem.musicFolderId === z.musicFolderId);
                if (folder === undefined) {
                  return;
                }

                return folder.name + (z.number.trim().length > 0 ? ' (' + z.number + ')' : '');
              })
              .filter((folderLabel) => !!folderLabel)
              .join(', '),
            link: currentScore.link,
            pageCount: x.pageCount,
            voice: voices
              .filter((voice) => voice.voiceId === x.voiceId)
              .map((voice) => voice.instrumentName + ' ' + voice.name)
              .join(', '),
          } as AllNotesData;
        })
        .filter((x) => x !== undefined);
    }),
  );

  voiceFilterChanged(event: number[] | undefined): void {
    const normalizedFilter = this.#normalizeVoiceFilter(event);

    this.#voiceFilter.next(normalizedFilter);
    this.#persistVoiceFilterForCurrentUser(normalizedFilter);
  }

  #restoreVoiceFilter(userId: string): void {
    const cookieKey = this.#getVoiceFilterCookieKey(userId);
    const cookieValue = this.#readCookie(cookieKey);

    if (cookieValue === undefined) {
      return;
    }

    const restoredFilter = this.#parseVoiceFilterCookie(cookieValue);

    this.#voiceFilter.next(restoredFilter);

    if (restoredFilter === undefined) {
      this.#deleteCookie(cookieKey);
    }
  }

  #persistVoiceFilterForCurrentUser(filterIds: number[] | undefined): void {
    if (this.#currentUserId) {
      this.#persistVoiceFilterByUserId(this.#currentUserId, filterIds);
      return;
    }

    this.#userId$.pipe(take(1)).subscribe((userId) => {
      this.#currentUserId = userId;
      this.#persistVoiceFilterByUserId(userId, filterIds);
    });
  }

  #persistVoiceFilterByUserId(userId: string, filterIds: number[] | undefined): void {
    const cookieKey = this.#getVoiceFilterCookieKey(userId);

    if (!filterIds || filterIds.length === 0) {
      this.#deleteCookie(cookieKey);
      return;
    }

    this.#writeCookie(cookieKey, JSON.stringify(filterIds), 60);
  }

  #parseVoiceFilterCookie(cookieValue: string): number[] | undefined {
    try {
      const parsed = JSON.parse(cookieValue) as unknown;
      return this.#normalizeVoiceFilter(parsed);
    } catch {
      return undefined;
    }
  }

  #normalizeVoiceFilter(input: unknown): number[] | undefined {
    if (!Array.isArray(input)) {
      return undefined;
    }

    const normalized = Array.from(
      new Set(
        input
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0),
      ),
    );

    return normalized.length > 0 ? normalized : undefined;
  }

  #getVoiceFilterCookieKey(userId: string): string {
    return `${this.#voiceFilterCookiePrefix}-${userId}`;
  }

  #readCookie(name: string): string | undefined {
    const cookieParts = document.cookie
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    const cookie = cookieParts.find((part) => part.startsWith(name + '='));
    if (!cookie) {
      return undefined;
    }

    return decodeURIComponent(cookie.substring(name.length + 1));
  }

  #writeCookie(name: string, value: string, expiresInDays: number): void {
    const expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  #deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }
}
