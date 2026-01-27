import {Component, inject} from '@angular/core';
import {IColumn, IRowAction, VmcDataGrid} from '@vm-components';
import {GroupService, IGroup} from './group.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-groups',
  imports: [
    VmcDataGrid,
    AsyncPipe
  ],
  templateUrl: './app-groups.component.html',
  styleUrl: './app-groups.component.scss',
})
export class AppGroups {
  readonly #groupService = inject(GroupService)

  logAction(action: IRowAction) {
    console.log('Action triggered:', action);
  }

  data$: Observable<IGroup[]> = this.#groupService.loadGroups$();

  columns: IColumn<IGroup>[] = [
    { key: 'groupId',   header: '',             field: 'groupId' },
    { key: 'name',      header: 'Name',           field: 'name' },
    { key: 'updatedAt', header: 'Geändert am',    field: 'updatedAt' },
    { key: 'createdAt', header: 'Erstellt am',    field: 'createdAt' },
    { key: 'updatedBy', header: 'Geändert von',   field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von',   field: 'createdBy' },
  ];
}
