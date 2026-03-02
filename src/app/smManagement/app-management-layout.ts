import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { VmSidebarGroup } from '@vm-components';
import { FoldersService } from '../me/folders/folders.service';

@Component({
  selector: 'app-management-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-management-layout.html',
  styleUrl: './app-management-layout.scss',
})
export class AppManagementLayout {
  private foldersService = new FoldersService();

  sidebarItems: VmSidebarGroup[] = [
    {
      groupName: 'Allgemein',
      items: [
        {
          name: 'Ungeprüft',
          route: '/scores/unverified',
        },
        {
          name: 'Alle Notenblätter',
          route: '/scores/repository',
        },
      ],
    },
    {
      groupName: 'Mappen',
      items: this.foldersService.mappenListe.map((folder) => ({
        name: folder.name,
        route: `/scores/folders/${folder.folderId}`,
      })),
    },
    {
      groupName: 'Konfiguraion',
      items: [
        {
          name: 'Mappen',
          route: '/scores/folders-conf',
        },
        {
          name: 'Stimmen/Instrumente',
          route: '/scores/stimmen-instrumente',
        },
      ],
    },
  ];
}
