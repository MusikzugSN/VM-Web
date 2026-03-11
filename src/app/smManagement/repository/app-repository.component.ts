import {Component, inject} from '@angular/core';

import {BehaviorSubject, switchMap} from 'rxjs';
import {Score, ScoreService} from '@vm-utils/services';
import {
  VmcDataGrid,
  VmcIconButton,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmInputField,
  VmToolbarItem
} from '@vm-components';
import {RepositoryDialogService} from './repository-dialog.service';
import {AsyncPipe} from '@angular/common';
import {convertToDisplayMinutes} from '@vm-utils';

@Component({
  selector: 'app-repository.component',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe, VmcIconButton],
  templateUrl: './app-repository.component.html',
  styleUrl: './app-repository.component.scss',
})
export class AppRepositoryComponent {
  readonly #scoresService = inject(ScoreService);
  readonly #dataDialogService = inject(RepositoryDialogService);

  #reload = new BehaviorSubject(false);

  data$ = this.#reload.pipe(switchMap((_) => this.#scoresService.load$()));

  toolbarItems: VmToolbarItem[] = [
    {
      key: 'addNotes',
      icon: 'add',
      label: 'Stück hinzufügen',
      acton: async (): Promise<void> => {
        await this.#dataDialogService.openNewScoreDialog();
        this.#reload.next(true);
      },
    },
  ];

  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  columns: VmColumn<Score>[] = [
    { key: 'title', header: 'Title', field: 'title', filterable: true },
    { key: 'composer', header: 'Komponist', field: 'composer', filterable: true },
    { key: 'duration', header: 'Länge', field: 'duration', type: "converter", converter: (score: Score) => convertToDisplayMinutes(score.duration ?? 0) + ' min' },
    { key: 'folders', header: 'Mappen', field: 'folders', type: "converter", converter : (score: Score) => score.folders?.map(x => x.musicFolderName + ' (' + x.number + ')').join(', ') },
    { key: 'changedAt', header: 'Bearbeitet am', field: 'updatedAt', type: 'date-time' },
    { key: 'changedBy', header: 'Bearbeitet von', field: 'updatedBy' },
    { key: 'customActions', header: '', type: 'template' },
  ];

  async execAction(rowData: Score, key: string): Promise<void> {
    if (key === 'edit') {
      const reload = await this.#dataDialogService.openEditScoreDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (key === 'delete') {
      const reload = await this.#dataDialogService.openEditScoreDialog(rowData);
      if (reload) {
        this.#reload.next(true);
      }
    }

    if (key === 'link') {
      window.open(rowData.link, '_blank');
    }
  }

}
