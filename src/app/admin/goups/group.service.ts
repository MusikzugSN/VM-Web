import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface IGroup {
  groupId: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  updatedBy: string;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  readonly #httpClient = inject(HttpClient);

  loadGroups$(): Observable<IGroup[]> {
    return this.#httpClient.get<IGroup[]>('group');
  }

}
