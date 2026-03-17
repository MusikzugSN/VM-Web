import {Component, computed, inject, signal, Signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import {VmSidebarGroup, VmSidebarItem} from '@vm-components';
import { FoldersService, PermissionService, PermissionType} from '@vm-utils/services';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-management-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-management-layout.html',
  styleUrl: './app-management-layout.scss',
})
export class AppManagementLayout {
  readonly #folderService = inject(FoldersService);
  readonly #permissionService = inject(PermissionService);

  isUnverifiedAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenValidateNotes));
  isRepositoryAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenScores));

  isFolderAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenMusicFolder));
  isVoicesAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenVoice));
  isEventsAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenEvent));
  //isTagsAllowed = toSignal(this.#permissionService.hasPermission$(PermissionType.OpenEvent));
  isTagsAllowed: Signal<boolean> = signal(true);

  folders = toSignal(this.#folderService.load$());

  sidebarItems = computed(() => {
    const sidebarItems: VmSidebarGroup[] = [];
    const unverifiedAllowed = this.isUnverifiedAllowed();
    const repositoryAllowed = this.isRepositoryAllowed();

    if (unverifiedAllowed || repositoryAllowed) {
      const gerneralItems: VmSidebarItem[] = [];

      if (unverifiedAllowed) {
        gerneralItems.push({
          name: 'Ungeprüft',
          route: '/scores/unverified',
        });
      }

      if (repositoryAllowed) {
        gerneralItems.push({
          name: 'Stücke',
          route: '/scores/repository',
        },);
      }

      sidebarItems.push({
        groupName: 'Allgemein',
        items: gerneralItems
      });
    }

    if (repositoryAllowed) {
      const folders = this.folders() ?? [];

      sidebarItems.push({
          groupName: 'Mappen',
          items: folders.map((folder) => ({
            name: folder.name,
            route: `/scores/folders/${folder.musicFolderId}`,
          })),
        });
    }

    const folderAllowed = this.isFolderAllowed();
    const voiceAllowed = this.isVoicesAllowed();
    const eventsAllowed = this.isEventsAllowed();
    const tagsAllowed = this.isTagsAllowed();

    if (folderAllowed || voiceAllowed || eventsAllowed || tagsAllowed) {
      const configItems: VmSidebarItem[] = [];

      if (folderAllowed) {
        configItems.push({
          name: 'Mappen',
          route: '/scores/folders-conf',
        });
      }

      if (voiceAllowed) {
        configItems.push({
          name: 'Stimmen/Instrumente',
          route: '/scores/stimmen-instrumente',
        });
      }

      if (eventsAllowed) {
        configItems.push({
          name: 'Events',
          route: '/scores/event-conf',
        });
      }

      if (tagsAllowed) {
        configItems.push({
          name: 'Tags',
          route: '/scores/tags',
        },
        {
          name: 'Druckereinstellungen',
          route: '/scores/print-conf',
        });
      }

      sidebarItems.push({
        groupName: 'Konfiguration',
        items: configItems
      });
    }

    return sidebarItems;
  });

}
