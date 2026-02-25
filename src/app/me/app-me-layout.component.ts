import { Component, inject } from '@angular/core';
import { VmSidebarGroup } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { FoldersService } from './folders/folders.service';

@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  private foldersService = inject(FoldersService);

  sidebarItems: VmSidebarGroup[] = [
    {
      groupName: 'Mappen',
      items: this.foldersService.mappenListe.map((folder) => ({
        name: folder.name,
        route: `/me/folders/${folder.folderId}`,
      })),
    },
    {
      groupName: 'Event',
      items: [
        {
          name: 'Alle', //todo entfernung von Alle Tab und ersetzen durch Event
          route: '/me/events',
        },
      ],
    },
    {
      groupName: 'Tags',
      items: [
        {
          name: 'Favouriten',
          route: '/me/tags/favorites'
        }
      ]
    }
  ];
}
