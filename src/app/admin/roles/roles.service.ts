import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BaseCrudService, IMetaData} from '@vm-utils';

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
  Delete = 4,
}

export interface IPermission {
  type: number;
  value: number;
}

export interface IRole extends IMetaData {
  roleId: number;
  name: string;
  permissions: IPermission[];
}

@Injectable({
  providedIn: 'root',
})
export class RolesService extends BaseCrudService<IRole>{
  override url: string = 'role';
  readonly #httpClient = inject(HttpClient);

  getPermissionStructure$(): Observable<IPermissionGroup[]> {
    return this.#httpClient.get<IPermissionGroup[]>('role/permissionValues');
  }
}
