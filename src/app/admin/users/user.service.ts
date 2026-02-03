import {Injectable} from '@angular/core';
import {BaseCrudService, IMetaData} from '@vm-utils';

export interface User extends IMetaData {
  userId: number;
  username: string;
  isAdmin: boolean;
  isEnabled: boolean;
  userGroupTeasers: UserGroupTeaser[];
}

export interface UserUpdate {
  userId: number;
  username: string;
  password?: string;
  isAdmin: boolean;
  isEnabled: boolean;
  userGroupTeasers: UserGroupTeaser[];
}

export interface UserGroupTeaser {
  groupId: number;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseCrudService<User, UserUpdate>{
    override url: string = 'user';

}
