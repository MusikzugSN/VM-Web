import { Injectable } from '@angular/core';
import {BaseCrudService, IMetaData} from '@vm-utils';

export interface IGroup extends IMetaData {
  groupId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService extends BaseCrudService<IGroup>{
  override url: string = 'group';
}
