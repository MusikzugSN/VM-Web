import { inject, Injectable } from '@angular/core';
import { AuthService, PermissionTeaserWithGroupId } from './auth.service';
import { combineLatest, map, Observable } from 'rxjs';

export enum PermissionType {
  Administrator = 0,

  OpenUser = 1,
  ListUser,
  CreateUser,
  UpdateUser,
  DeleteUser,

  OpenGroup,
  ListGroup,
  CreateGroup,
  UpdateGroup,
  DeleteGroup,

  OpenRole,
  ListRole,
  CreateRole,
  UpdateRole,
  DeleteRole,

  OpenLoginSettings,
  ListLoginSettings,
  CreateLoginSettings,
  UpdateLoginSettings,
  DeleteLoginSettings,

  OpenVoice,
  ListVoice,
  CreateVoice,
  UpdateVoice,
  DeleteVoice,

  OpenTags,
  CreateTags,
  UpdateTags,
  DeleteTags,

  OpenScores,
  ListScore,
  CreateScore,
  UpdateScore,
  DeleteScore,

  OpenEvent,
  ListEvent,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,

  OpenMusicFolder,
  ListMusicFolder,
  CreateMusicFolder,
  UpdateMusicFolder,
  DeleteMusicFolder,

  OpenValidateNotes,
  UpdateValidateNotes,

  OpenMyNotes,
  CreateMyNotes,
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  readonly #authService = inject(AuthService);

  permissions$ = this.#authService.myInformation$.pipe(map((info) => info?.permissions ?? []));

  isAdmin$ = this.#authService.myInformation$.pipe(map((info) => info?.isAdmin ?? false));

  hasPermission$(permissionType: PermissionType, groupId?: number): Observable<boolean> {
    return combineLatest([this.permissions$, this.isAdmin$]).pipe(
      map(([permissions, isAdmin]) =>
        this.#checkIfOnePermissionIsValid(permissions, isAdmin, [permissionType], groupId),
      ),
    );
  }

  hasPermissionFromMany$(permissionType: PermissionType[], groupId?: number): Observable<boolean> {
    return combineLatest([this.permissions$, this.isAdmin$]).pipe(
      map(([permissions, isAdmin]) =>
        this.#checkIfOnePermissionIsValid(permissions, isAdmin, permissionType, groupId),
      ),
    );
  }

  #checkIfOnePermissionIsValid(
    permissions: PermissionTeaserWithGroupId[],
    isAdmin: boolean,
    permissionType: PermissionType[],
    groupId?: number,
  ): boolean {
    if (isAdmin) {
      return true;
    }

    const hasAdminPermission = permissions.some((p) => p.permissionType === PermissionType.Administrator);

    if (hasAdminPermission) {
      return true;
    }

    const validPermissions = permissions.filter((p) => permissionType.includes(p.permissionType));

    if (groupId !== undefined) {
      return validPermissions.some((p) => p.groupId === groupId);
    } else {
      return validPermissions.length > 0;
    }
  }
}
