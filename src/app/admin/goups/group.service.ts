import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface Group extends IMetaData {
  groupId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService extends BaseCrudService<Group> {
  override url: string = 'group';
}
