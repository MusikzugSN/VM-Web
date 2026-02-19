import { Component, inject } from '@angular/core';
import { GroupDialogService } from '../../admin/goups/group-dialog.service';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { AsyncPipe } from '@angular/common';
import { MusicSheet, MusicSheetService } from './musicSheet.service';
import { Score, ScoreService } from './score.service';

interface AllNotesData {
  name: string;
  composer: string;
  folders: string;
  link: string;
  pageCount: number;
  voiceName: string;
}

@Component({
  selector: 'app-all-notes',
  imports: [AsyncPipe, VmcDataGrid, VmcToolbar, VmcInputField],
  templateUrl: './app-allNotes.component.html',
  styleUrl: './app-allNotes.component.scss',
})
export class AppAllNotesComponent {
  readonly #MusicSheetService = inject(MusicSheetService);
  readonly #ScoreService = inject(ScoreService);
  readonly #groupDataDialogService = inject(GroupDialogService);

  #reload = new BehaviorSubject(false);

  items: VmToolbarItem[] = [
    {
      key: 'addNotes',
      icon: 'add',
      label: 'Notenblätter hinzufügen',
      acton: async (): Promise<void> => {
        await this.#groupDataDialogService.openNewGroupDialog();
        this.#reload.next(true);
      },
    },
    {
      key: 'download',
      icon: 'file_download',
      label: 'Herunterladen',
      acton: async (): Promise<void> => {},
    },
    {
      key: 'drucken',
      icon: 'print',
      label: 'Drucken',
      acton: async (): Promise<void> => {},
    },
  ];
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

  filter: VmFormField = {
    key: 'voiceSelect',
    type: 'select',
    label: 'Filter',
    options: [
      { value: 'stimme 1', label: 'Stimme 1' },
      { value: 'stimme 2', label: 'Stimme 2' },
      { value: 'stimme 3', label: 'Stimme 3' },
    ],
  };
  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  filterSelectionChange(event: VmValidFormTypes) {
    console.log(event);
  }

  columns: VmColumn<AllNotesData>[] = [
    { key: 'name', header: 'Name', field: 'name' },
    { key: 'composer', header: 'Komponist', field: 'composer' },
    { key: 'folders', header: 'Mappen', field: 'folders' },
    { key: 'pageCount', header: 'Seitenanzahl', field: 'pageCount' },
    { key: 'voiceName', header: 'Stimme', field: 'voiceName' },
  ];
  protected readonly onselectionchange = onselectionchange;
}
