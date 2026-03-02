import { Component, inject } from '@angular/core';
import { VmSidebarGroup } from '@vm-components';
import { RouterOutlet } from '@angular/router';
import { VmpSidebar } from '@vm-parts';
import { FoldersService } from './folders/folders.service';
import { EventService } from './event/event.service';
import { TagsService } from './tags/Tag.service';

@Component({
  selector: 'app-me-layout',
  imports: [RouterOutlet, VmpSidebar],
  templateUrl: './app-me-layout.component.html',
  styleUrl: './app-me-layout.component.scss',
})
export class AppMeLayout {
  private foldersService = inject(FoldersService);
  private eventsService = inject(EventService);
  private tagsService = inject(TagsService);

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
      items: this.eventsService.eventListe.map((event) => ({
        name: event.name,
        route: `/me/event/${event.eventId}`,
      })),
    },
    {
      groupName: 'Tags',
      items: this.tagsService.tagListe.map((tag) => ({
        name: tag.name,
        route: `/me/tag/${tag.tagId}`,
      })) }
  ];
}
