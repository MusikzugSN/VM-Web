import { Component, inject, input, InputSignal } from '@angular/core';
import { Router } from '@angular/router';
import { VmcExtentionPannel } from '../../layout/extentionPanel/vmc-extention-pannel.component';
import { VmcToolbar } from '../../layout/toolbar/vmc-toolbar.component';

export interface VmSidebarGroup {
  groupName: string;
  items: VmSidebarItem[];
}

export interface VmSidebarItem {
  name: string;
  route: string;
  icon?: string;
  selected?: boolean;
}

@Component({
  selector: 'vmc-sidebar',
  imports: [VmcExtentionPannel, VmcToolbar],
  templateUrl: './vmc-sidebar.component.html',
  styleUrl: './vmc-sidebar.component.scss',
})
export class VmcSidebar {
  readonly #router = inject(Router);

  sidebarItems: InputSignal<VmSidebarGroup[]> = input.required();

  async redirect(url: string): Promise<void> {
    await this.#router.navigate([url]);
  }
}
