import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {convertMetaDataFromDto, IMetaData} from '@vm-utils';

export interface IPermissionGroup {
  name: string;
  permissionValues: IPermissionValue[];
}

export interface IPermissionValue {
  permissionType: number;
  description: PermissionCategory;
}

export enum PermissionCategory {
  Start = 0,
  Read = 1,
  Create = 2,
  Update = 3,
  Delete = 4
}

export interface IPermission {
  type: number;
  value: number;
}

export interface IRole extends IMetaData{
  roleId: number;
  name: string;
  permissions: IPermission[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  readonly #httpClient = inject(HttpClient);

  getPermissionStructure$(): Observable<IPermissionGroup[]> {
    return this.#httpClient.get<IPermissionGroup[]>('role/permissionValues');
  }

  getRoles$(): Observable<IRole[]> {
    return this.#httpClient.get<IRole[]>('role')
      .pipe(map(role => convertMetaDataFromDto(role)));
  }

  deleteRole$(roleId: number): Observable<boolean> {
    return this.#httpClient.delete<boolean>(`role/${roleId}`);
  }

  createRole$(role: Partial<IRole>): Observable<IRole> {
    return this.#httpClient.post<IRole>('role', role);
  }

  changeRole$(rolePatch: Partial<IRole>): Observable<IRole> {
    return this.#httpClient.patch<IRole>(`role/${rolePatch.roleId}`, rolePatch);
  }
}
