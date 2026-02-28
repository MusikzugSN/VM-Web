import { Component } from '@angular/core';
import { VmSidebarGroup } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';

@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  sidebarItems: VmSidebarGroup[] = [
    {
      groupName: 'Mappen',
      items: [
        {
          name: 'Testmappe',
          route: '/me/testmappe',
        },
      ],
    },
    {
      groupName: 'Stücke',
      items: [
        {
          name: 'Alle',
          route: '/me/allNotes',
        },
      ],
    },
  ];
}
