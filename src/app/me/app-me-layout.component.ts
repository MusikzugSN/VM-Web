import { Component, inject } from '@angular/core';
import { VmSidebarGroup } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { FoldersService } from './folders/folders.service';
import { EventService } from './event/event.service';
import { TagsService } from './tags/Tag.service';
import {map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar, AsyncPipe],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  readonly #foldersService = inject(FoldersService);
  private eventsService = inject(EventService);
  private tagsService = inject(TagsService);

  eventItems: VmSidebarGroup = {
    groupName: 'Event',
    items: this.eventsService.eventListe.map((event) => ({
      name: event.name,
      route: `/me/event/${event.eventId}`,
    })),
  };

  tagItems: VmSidebarGroup = {
    groupName: 'Tags',
    items: this.tagsService.tagListe.map((tag) => ({
      name: tag.name,
      route: `/me/tag/${tag.tagId}`,
    }))
  };

  sidebarItems$: Observable<VmSidebarGroup[]> = this.#foldersService.load$()
    .pipe(map(folders => {
      return [
        {
          groupName: 'Mappen',
          items: folders.map((folder) => ({
            name: folder.name,
            route: `/scores/folders/${folder.musicFolderId}`,
          })),
        },
        this.eventItems,
        this.tagItems,
      ];
    }));


}
