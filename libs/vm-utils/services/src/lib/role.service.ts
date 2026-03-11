import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface PermissionGroup {
  name: string;
  permissionValues: PermissionValue[];
}

export interface PermissionValue {
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

export interface Permission {
  type: number;
  value: number;
}

export interface Role extends IMetaData {
  roleId: number;
  name: string;
  permissions: Permission[];
}

@Injectable({
  providedIn: 'root',
})
export class RoleService extends BaseCrudService<Role> {
  override url: string = 'role';
  readonly #httpClient = inject(HttpClient);

  getPermissionStructure$(): Observable<PermissionGroup[]> {
    return this.#httpClient.get<PermissionGroup[]>('role/permissionValues');
  }
}
