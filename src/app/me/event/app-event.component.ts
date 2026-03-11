import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from './event.service';
import {distinctUntilChanged, firstValueFrom, map} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';

@Component({
  selector: 'app-event.component',
  imports: [VmpNotesFullPageComponent],
  templateUrl: './app-event.component.html',
  styleUrl: './app-event.component.scss',
})
export class AppEventComponent {
  event?: Event;

  isError = false;
  private route = inject(ActivatedRoute);
  protected eventServiceComponent = inject(EventService);

  notes: AllNotesData[] = [];
  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('eventId')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe(async (eventId) => {
        this.isError = false;

        if (!eventId) {
          this.isError = true;
          return;
        }
        const found = await firstValueFrom(this.eventServiceComponent.loadById$(+eventId));

        if (found) {
          this.event = found;
          this.isError = false;
        } else {
          this.isError = true;
          this.event = undefined;
        }
      });
  }
}
