import { Component, inject } from '@angular/core';
import {AllNotesData, VmpNotesFullPageComponent} from '@vm-parts';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Tag, TagsService } from '@vm-utils/services';

@Component({
  selector: 'app-tags-layout',
  imports: [VmpNotesFullPageComponent],
  templateUrl: './app-tags.component.html',
  styleUrl: './app-tags.component.scss',
})
export class AppTagsComponent {
  tag?: Tag;

  isError = false;

  notes: AllNotesData[] = [];
  private route = inject(ActivatedRoute);
  protected tagServiceComponent = inject(TagsService);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('tagId')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((tagId) => {
        this.isError = false;

        if (!tagId) {
          this.isError = true;
          return;
        }

        const found = this.tagServiceComponent.getTagById(+tagId);

        if (found) {
          this.tag = found;
          this.isError = false;
        } else {
          this.isError = true;
          this.tag = undefined;
        }
      });
  }
}
