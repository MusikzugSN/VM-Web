import { Component, inject } from '@angular/core';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils';
import { firstValueFrom, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Tag, TagsService } from '../../../me/tags/Tag.service';

@Component({
  selector: 'app-tags-delete-dialog.component',
  imports: [],
  templateUrl: './tags-delete-dialog.component.html',
  styleUrl: './tags-delete-dialog.component.scss',
})
export class TagsDeleteDialog extends DialogBase<boolean> {
  readonly #data = inject<Tag>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #tagService = inject(TagsService);

  name = this.#data.name;

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      if (x === 'delete') {
        await firstValueFrom(this.#tagService.delete$(this.#data.tagId));

        super.closeDialog(true);
      } else if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }
}
