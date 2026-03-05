import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { VmSidebarGroup } from '@vm-components';
import { FoldersService } from '../me/folders/folders.service';
import {map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-management-layout',
  imports: [RouterOutlet, VmpSidebar, AsyncPipe],
  templateUrl: './app-management-layout.html',
  styleUrl: './app-management-layout.scss',
})
export class AppManagementLayout {
  readonly #folderService = inject(FoldersService);

  allgemeineRouten: VmSidebarGroup = {
      groupName: 'Allgemein',
      items: [
        {
          name: 'Ungeprüft',
          route: '/scores/unverified',
        },
        {
          name: 'Stücke',
          route: '/scores/repository',
        },
      ],
    };

    konfigurationRouten: VmSidebarGroup = {
      groupName: 'Konfiguration',
      items: [
        {
          name: 'Mappen',
          route: '/scores/folders-conf',
        },
        {
          name: 'Stimmen/Instrumente',
          route: '/scores/stimmen-instrumente',
        },
        {
          name: 'Events',
          route: '/scores/event-conf',
        },
        {
          name: 'Tags',
          route: '/scores/tags',
        }
      ],
    };

  sidebarItems$: Observable<VmSidebarGroup[]> = this.#folderService.load$()
    .pipe(map(folders => {
      return [
        this.allgemeineRouten,
        {
          groupName: 'Mappen',
          items: folders.map((folder) => ({
            name: folder.name,
            route: `/scores/folders/${folder.musicFolderId}`,
          })),
        },
        this.konfigurationRouten,
      ];
  }));
}
