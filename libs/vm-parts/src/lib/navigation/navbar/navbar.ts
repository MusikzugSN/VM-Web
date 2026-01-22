import { Component } from '@angular/core';
import {IToolbarItem, Toolbar} from '@vm-components';

@Component({
  selector: 'vmp-navbar',
  imports: [
    Toolbar
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  toolbarItems: IToolbarItem[] = [
    { name: 'Mein Bereich', route: '/me', selected: true },
    { name: 'Notenverwaltung', route: '/notes' },
    { name: 'Systemverwaltung', route: '/admin' }
  ];
}
