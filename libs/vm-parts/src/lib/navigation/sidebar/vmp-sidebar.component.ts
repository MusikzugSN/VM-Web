import {Component, inject, input, InputSignal} from '@angular/core';
import {ISidebarGroup, VmcSidebar} from '@vm-components';
import {CurrentRouteService} from '@vm-utils';
import {combineLatest, map, Observable} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'vmp-sidebar',
  imports: [
    VmcSidebar,
    AsyncPipe
  ],
  templateUrl: './vmp-sidebar.component.html',
  styleUrl: './vmp-sidebar.component.scss',
})
export class VmpSidebar {
  readonly #currentRouteService = inject(CurrentRouteService);

  sidebarItems: InputSignal<ISidebarGroup[]> = input.required();

  sidebarItemsWithSelection$: Observable<ISidebarGroup[]> = combineLatest([this.#currentRouteService.route$, toObservable(this.sidebarItems)])
    .pipe(map(([route, groupItems]) => {
        return this.mapGroupSelectionWithRoute(groupItems, route);
      })
    );

  private mapGroupSelectionWithRoute(groupItems: ISidebarGroup[], route: string): ISidebarGroup[] {
    return groupItems.map(groupItem => {
      return {...groupItem, items: groupItem.items.map(item => {
          return {...item, selected: route.startsWith(item.route)};
        })
      };
    });
  }

}

