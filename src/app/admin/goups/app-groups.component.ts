import {Component, inject} from '@angular/core';
import {IColumn, IRowClickedEvent, VmcDataGrid} from '@vm-components';
import {GroupService, IGroup} from './group.service';
import {BehaviorSubject, Observable, switchMap} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {EditGroupDiaogService} from './editDialog/edit-group-diaog.service';
import {DeleteGroupDialogService} from './deleteDialog/delete-group-dialog.service';

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
  readonly #editGrouDialogService = inject(EditGroupDiaogService);
  readonly #deleteGroupDialogService = inject(DeleteGroupDialogService);

  #reload = new BehaviorSubject(false);

  async execAction(action: IRowClickedEvent<IGroup>) {
    if (action.key === 'edit') {
      const reload = await this.#editGrouDialogService.openEditGroupDialog(action.rowData);

      if (reload) {
        this.#reload.next(true);
      }
      return;
    }

    if (action.key === 'delete') {
      const reload = await this.#deleteGroupDialogService.openEditGroupDialog(action.rowData);

      if (reload) {
        this.#reload.next(true);
      }
    }
  }

  data$: Observable<IGroup[]> = this.#reload.pipe(switchMap(x => this.#groupService.loadGroups$()));

  columns: IColumn<IGroup>[] = [
    { key: 'groupId',   header: '',             field: 'groupId' },
    { key: 'name',      header: 'Name',           field: 'name' },
    { key: 'updatedAt', header: 'Geändert am',    field: 'updatedAt' },
    { key: 'createdAt', header: 'Erstellt am',    field: 'createdAt' },
    { key: 'updatedBy', header: 'Geändert von',   field: 'updatedBy' },
    { key: 'createdBy', header: 'Erstellt von',   field: 'createdBy' },
  ];
}
