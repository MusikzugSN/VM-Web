import {Component, inject} from '@angular/core';
import {VmSidebarGroup} from '@vm-components';
import {RouterOutlet} from '@angular/router';
import {VmpSidebar} from '@vm-parts';
import {EventService, FoldersService, TagsService} from '@vm-utils/services';
import {combineLatest, map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';


@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar, AsyncPipe],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  readonly #foldersService = inject(FoldersService);
  readonly #eventsService = inject(EventService);
  readonly #tagsService = inject(TagsService);
  //readonly #permissionService = inject(PermissionService);

  eventGroup$: Observable<VmSidebarGroup> = this.#eventsService.loadForMyArea$()
    .pipe(map(event => {
      return {
        groupName: 'Events',
        items: event.map((folder) => ({
          name: folder.name,
          route: `/me/event/${folder.eventId}`,
        })),
      };
    }));

  tagItems: VmSidebarGroup = {
    groupName: 'Tags',
    items: this.#tagsService.tagListe.map((tag) => ({
      name: tag.name,
      route: `/me/tag/${tag.tagId}`,
    }))
  };

  folderGroup$: Observable<VmSidebarGroup> = this.#foldersService.loadForMyArea$()
    .pipe(map(folders => {
      return {
          groupName: 'Mappen',
          items: folders.map((folder) => ({
            name: folder.name,
            route: `/me/folders/${folder.musicFolderId}`,
          })),
        };
    }));

  sidebarItems$: Observable<VmSidebarGroup[]> = combineLatest([this.folderGroup$, this.eventGroup$])
    .pipe(map(([folderGroup, eventGroup]) => [folderGroup, eventGroup, this.tagItems]));


}
