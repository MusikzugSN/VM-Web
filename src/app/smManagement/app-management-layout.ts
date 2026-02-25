import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { VmSidebarGroup } from '@vm-components';

@Component({
  selector: 'app-management-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-management-layout.html',
  styleUrl: './app-management-layout.scss',
})
export class AppManagementLayout {
  sidebarItems: VmSidebarGroup[] = [
    {
      groupName: '',
      items: [
        {
          name: 'Ungeprüft',
          route: '/scores/unverified',
        },
      ],
    },
    {
      groupName: 'Mappen',
      items: [
        {
          name: 'Alle',
          route: '/scores/allNotes',
        },
      ],
    },
    {
      groupName: '',
    items: [
      {
        name: 'Alle Notenblätter',
        route: '/scores/repository'
      }
    ]
    }
  ];
}
