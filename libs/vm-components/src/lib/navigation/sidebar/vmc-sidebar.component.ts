import {Component, inject, input, InputSignal} from '@angular/core';
import {Router} from '@angular/router';
import {VmcExtentionPannel} from '../../layout/extentionPanel/vmc-extention-pannel.component';
import {VmcToolbar} from '../../layout/toolbar/vmc-toolbar.component';

export interface ISidebarGroup {
  groupName: string;
  items: ISidebarItem[];
}

export interface ISidebarItem {
  name: string;
  route: string;
  icon?: string;
  selected?: boolean;
}

@Component({
  selector: 'vmc-sidebar',
  imports: [
    VmcExtentionPannel,
    VmcToolbar
  ],
  templateUrl: './vmc-sidebar.component.html',
  styleUrl: './vmc-sidebar.component.scss',
})
export class VmcSidebar {
  readonly #router = inject(Router);

  sidebarItems: InputSignal<ISidebarGroup[]> = input.required();

  async redirect(url: string) {
    await this.#router.navigate([url]);
  }
}
