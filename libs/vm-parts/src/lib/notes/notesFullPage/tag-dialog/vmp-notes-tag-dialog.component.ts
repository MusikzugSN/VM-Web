import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { AsPipe, nameOf, NumDictionary } from '@vm-utils';
import {
  MusicSheetService,
  MusicSheetTagTeaser,
  Tag,
  TagsService,
} from '@vm-utils/services';
import { DIALOG_BUTTON_CLICKS, DIALOG_DATA, DialogBase } from '@vm-utils/dialogs';
import { SnackbarService } from '@vm-utils/snackbar';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable } from 'rxjs';

interface TagDialogData {
  notesId: number;
}

@Component({
  selector: 'vmp-notes-tag-dialog',
  imports: [VmcDataGrid, VmcInputField, AsyncPipe, AsPipe],
  templateUrl: './vmp-notes-tag-dialog.component.html',
  styleUrl: './vmp-notes-tag-dialog.component.scss',
})
export class VmpNotesTagDialogComponent extends DialogBase<boolean> {
  readonly #data = inject<TagDialogData>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);

  readonly #musicSheetService = inject(MusicSheetService);
  readonly #tagsService = inject(TagsService);
  readonly #snackbarService = inject(SnackbarService);

  readonly #allTags$ = this.#tagsService.load$();

  #initialTags: MusicSheetTagTeaser[] = [];
  #changedTagValues: MusicSheetTagTeaser[] = [];
  #selectedTagId = -1;

  noteTagsData$ = new BehaviorSubject<MusicSheetTagTeaser[]>([]);

  #tagOptions$: Observable<VmSelectOption[]> = combineLatest([this.#allTags$, this.noteTagsData$]).pipe(
    map(([allTags, assignedTags]) => {
      const assignedIds = new Set(assignedTags.map((x) => x.tagId));
      return allTags
        .filter((tag) => !assignedIds.has(tag.tagId))
        .map((tag) => ({ label: tag.name, value: tag.tagId.toString() }));
    }),
  );

  tagOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#tagOptions$, {
    initialValue: [],
  });

  #tagsById$: Observable<NumDictionary<Tag>> = this.#allTags$.pipe(
    map((tags) => tags.reduce((acc, tag) => ({ ...acc, [tag.tagId]: tag }), {} as NumDictionary<Tag>)),
  );

  tagsById = toSignal<NumDictionary<Tag>, NumDictionary<Tag>>(this.#tagsById$, {
    initialValue: {},
  });

  // @ts-expect-error
  TagType: MusicSheetTagTeaser;

  tagColumns: VmColumn<MusicSheetTagTeaser>[] = [
    {
      key: 'tag',
      header: 'Tag',
      field: nameOf<MusicSheetTagTeaser>('tagId'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  tagRowActions: VmRowAction[] = [{ key: 'delete', icon: 'delete' }];
  footerActions: VmRowAction[] = [{ key: 'add', icon: 'add' }];

  constructor() {
    super();

    this.#musicSheetService
      .loadByIdWithTags$(this.#data.notesId)
      .pipe(takeUntilDestroyed())
      .subscribe((musicSheet) => {
        this.#initialTags = musicSheet.tags ?? [];
        this.noteTagsData$.next(this.#initialTags);
      });

    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (key) => {
      if (key === 'save') {
        try {
          if (this.#changedTagValues.length > 0) {
            await firstValueFrom(
              this.#musicSheetService.changeTags$(this.#data.notesId, this.#changedTagValues),
            );
          }

          super.closeDialog(true);
        } catch {
          this.#snackbarService.raiseError('Tags konnten nicht gespeichert werden.', 3000);
        }
        return;
      }

      if (key === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeNewTagChange(value: VmValidFormTypes): void {
    this.#selectedTagId = parseInt(value as string, 10);
  }

  execActionFromRow(event: VmRowClickedEvent<MusicSheetTagTeaser>): void {
    if (event.key === 'add') {
      if (this.#selectedTagId < 0) {
        return;
      }

      this.#storeNewTagValue({ tagId: this.#selectedTagId });
      this.#selectedTagId = -1;
      return;
    }

    if (event.key === 'delete' && event.rowData) {
      this.#storeDeletedTagValue(event.rowData);
    }
  }

  #storeChangedTagValues(): void {
    let newData = [...this.#initialTags];

    for (const changedTag of this.#changedTagValues) {
      if (changedTag.deleted) {
        newData = newData.filter((x) => x.tagId !== changedTag.tagId);
      } else {
        newData.push(changedTag);
      }
    }

    this.noteTagsData$.next(newData);
  }

  #storeNewTagValue(newValue: MusicSheetTagTeaser): void {
    const currentValues = this.noteTagsData$.getValue();
    if (currentValues.find((x) => x.tagId === newValue.tagId)) {
      this.#snackbarService.raiseError('Der Tag ist bereits zugewiesen.', 2500);
      return;
    }

    if (this.#changedTagValues.find((x) => x.tagId === newValue.tagId && x.deleted)) {
      this.#changedTagValues = this.#changedTagValues.filter(
        (x) => !(x.tagId === newValue.tagId && x.deleted),
      );
    } else {
      this.#changedTagValues.push({ tagId: newValue.tagId });
    }

    this.#storeChangedTagValues();
  }

  #storeDeletedTagValue(deletedValue: MusicSheetTagTeaser): void {
    if (this.#changedTagValues.find((x) => x.tagId === deletedValue.tagId)) {
      this.#changedTagValues = this.#changedTagValues.filter((x) => x.tagId !== deletedValue.tagId);
    } else {
      this.#changedTagValues.push({ tagId: deletedValue.tagId, deleted: true });
    }

    this.#storeChangedTagValues();
  }
}


