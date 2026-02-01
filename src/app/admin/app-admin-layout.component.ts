import { Component } from '@angular/core';
import { ISidebarGroup } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-admin-layout.component.html',
  styleUrl: './app-admin-layout.component.scss',
})
export class AppAdminLayout {
  sidebarItems: ISidebarGroup[] = [
    {
      groupName: 'Grundeinstellungen',
      items: [
        {
          name: 'Allgemein',
          route: '/admin/general',
        },
        {
          name: 'Vereinsgruppen',
          route: '/admin/groups',
        },
      ],
    },
    {
      groupName: 'Benutzer und Rollen',
      items: [
        {
          name: 'Rollen',
          route: '/admin/roles',
        },
        {
          name: 'Benutzer',
          route: '/admin/users',
        },
      ],
    },
  ];
}
