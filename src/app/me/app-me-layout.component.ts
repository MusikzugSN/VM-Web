import { Component, computed, inject } from '@angular/core';
import { VmSidebarGroup, VmSidebarItem } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import {
  EventService,
  FoldersService,
  PermissionService,
  PermissionType,
  TagsService,
} from '@vm-utils/services';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  readonly #foldersService = inject(FoldersService);
  readonly #eventsService = inject(EventService);
  readonly #tagsService = inject(TagsService);
  readonly #permissionService = inject(PermissionService);

  readonly canOpenFolders = toSignal(
    this.#permissionService.hasPermission$(PermissionType.OpenMusicFolder),
    { initialValue: false },
  );
  readonly canOpenEvents = toSignal(
    this.#permissionService.hasPermission$(PermissionType.OpenEvent),
    {
      initialValue: false,
    },
  );
  readonly canOpenTags = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenTags), {
    initialValue: false,
  });

  readonly folders = toSignal(this.#foldersService.loadForMyArea$(), { initialValue: [] });
  readonly events = toSignal(this.#eventsService.loadForMyArea$(), { initialValue: [] });
  readonly tags = toSignal(this.#tagsService.loadForMyArea$(), { initialValue: [] });

  readonly sidebarItems = computed<VmSidebarGroup[]>(() => {
    const sidebarItems: VmSidebarGroup[] = [];

    if (this.canOpenFolders()) {
      const folderItems: VmSidebarItem[] = this.folders().map((folder) => ({
        name: folder.name,
        route: `/me/folders/${folder.musicFolderId}`,
      }));

      sidebarItems.push({
        groupName: 'Mappen',
        items: folderItems,
      });
    }

    if (this.canOpenEvents()) {
      const eventItems: VmSidebarItem[] = this.events().map((event) => ({
        name: event.name,
        route: `/me/event/${event.eventId}`,
      }));

      sidebarItems.push({
        groupName: 'Events',
        items: eventItems,
      });
    }

    if (this.canOpenTags()) {
      const tagItems: VmSidebarItem[] = this.tags().map((tag) => ({
        name: tag.name,
        route: `/me/tags/${tag.tagId}`,
      }));

      sidebarItems.push({
        groupName: 'Tags',
        items: tagItems,
      });
    }

    return sidebarItems;
  });
}
