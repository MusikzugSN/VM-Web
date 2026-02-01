import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { convertMetaDataFromDto, IMetaData } from '@vm-utils';

export interface IGroup extends IMetaData {
  groupId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  readonly #httpClient = inject(HttpClient);

  createGroup$(group: Partial<IGroup>): Observable<IGroup> {
    return this.#httpClient.post<IGroup>('group', group);
  }

  changeGroup$(groupPatch: Partial<IGroup>): Observable<IGroup> {
    return this.#httpClient.patch<IGroup>(`group/${groupPatch.groupId}`, groupPatch);
  }

  deleteGroup$(groupId: number): Observable<boolean> {
    return this.#httpClient.delete<boolean>(`group/${groupId}`);
  }

  loadGroups$(): Observable<IGroup[]> {
    return this.#httpClient
      .get<IGroup[]>('group')
      .pipe(map((groups) => convertMetaDataFromDto(groups)));
  }
}
