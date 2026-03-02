import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from './event.service';
import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VmpNotesFullPageComponent } from '@vm-parts';
import { AllNotesData } from '../../smManagement/repository/app-repository.component';

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
      .subscribe((eventId) => {
        this.isError = false;

        if (!eventId) {
          this.isError = true;
          return;
        }
        const found = this.eventServiceComponent.getEventById(+eventId);

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
