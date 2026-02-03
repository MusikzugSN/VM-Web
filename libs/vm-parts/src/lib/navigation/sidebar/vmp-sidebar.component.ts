import { Component, inject, input, InputSignal } from '@angular/core';
import { VmSidebarGroup, VmcSidebar } from '@vm-components';
import { CurrentRouteService } from '@vm-utils';
import { combineLatest, map, Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'vmp-sidebar',
  imports: [VmcSidebar, AsyncPipe],
  templateUrl: './vmp-sidebar.component.html',
  styleUrl: './vmp-sidebar.component.scss',
})
export class VmpSidebar {
  readonly #currentRouteService = inject(CurrentRouteService);

  sidebarItems: InputSignal<VmSidebarGroup[]> = input.required();

  sidebarItemsWithSelection$: Observable<VmSidebarGroup[]> = combineLatest([
    this.#currentRouteService.route$,
    toObservable(this.sidebarItems),
  ]).pipe(
    map(([route, groupItems]) => {
      return this.mapGroupSelectionWithRoute(groupItems, route);
    }),
  );

  private mapGroupSelectionWithRoute(groupItems: VmSidebarGroup[], route: string): VmSidebarGroup[] {
    return groupItems.map((groupItem) => {
      return {
        ...groupItem,
        items: groupItem.items.map((item) => {
          return { ...item, selected: route.startsWith(item.route) };
        }),
      };
    });
  }
}
