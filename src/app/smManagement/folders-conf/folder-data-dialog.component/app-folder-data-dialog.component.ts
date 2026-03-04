import { Component, inject } from '@angular/core';
import {
  convertToPatch,
  DIALOG_BUTTON_CLICKS,
  DIALOG_DATA,
  DialogBase,
  Dictionary,
  nameOf,
  NumDictionary,
} from '@vm-utils';
import {
  Folder,
  FoldersService,
  FolderStueckTeaser,
  updateFolder,
} from '../../../me/folders/folders.service';
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, map, Observable} from 'rxjs';
import {
  VmcInputField,
  VmColumn,
  VmFormField,
  VmRowAction,
  VmSelectOption,
  VmValidFormTypes,
} from '@vm-components';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Group, GroupService} from '../../../admin/goups/group.service';
import { AsyncPipe } from '@angular/common';

const noGroupOption: VmSelectOption = {
  label: 'Keine Gruppe',
  value: '',
};


const folderNameKey = nameOf<Folder>('name');

@Component({
  selector: 'app-folder-data-dialog.component',
  imports: [VmcInputField, AsyncPipe],
  templateUrl: './app-folder-data-dialog.component.html',
  styleUrl: './app-folder-data-dialog.component.scss',
})
export class AppFolderDataDialog extends DialogBase<boolean> {
  readonly #data = inject<Folder | undefined>(DIALOG_DATA);
  readonly #buttonClickEvents$ = inject<Observable<string | null>>(DIALOG_BUTTON_CLICKS);
  readonly #folderService = inject(FoldersService);
  readonly #groupService = inject(GroupService);
  groupsdata$: Observable<Group[]> = this.#groupService.load$();



  #groupOptions$: Observable<VmSelectOption[]> = this.groupsdata$.pipe(
    map((x) => x.map((group) => ({ label: group.name, value: group.groupId.toString() }))),
  );

  groupOptions = toSignal<VmSelectOption[], VmSelectOption[]>(this.#groupOptions$, {
    initialValue: [],
  });

  #groupsById$: Observable<NumDictionary<Group>> = this.groupsdata$.pipe(
    map((x) =>
      x.reduce((acc, group) => ({ ...acc, [group.groupId]: group }), {} as NumDictionary<Group>),
    ),
  );

  groupsById = toSignal<NumDictionary<Group>, NumDictionary<Group>>(this.#groupsById$, {
    initialValue: {},
  });



  folderNameField: VmFormField = {
    type: 'text',
    key: nameOf<updateFolder>('name'),
    label: 'Mappename',
    required: true,
    value: this.#data?.name ?? '',
    placeholder: 'z. B. Schlägertrupp',
  };
  groupSelectorFieldPlaceholder: VmFormField = {
    key: nameOf<Group>('name'),
    label: 'Gruppe',
    type: 'select',
    options: [noGroupOption],
  };

  stueckColumns: VmColumn<FolderStueckTeaser>[] = [
    {
      key: 'scoreId',
      header: 'Stück ID',
      field: nameOf<FolderStueckTeaser>('scoreId'),
      type: 'template',
      footerAsTemplate: true,
    },
    {
      key: 'title',
      header: 'Name',
      field: nameOf<FolderStueckTeaser>('title'),
      type: 'template',
      footerAsTemplate: true,
    },
  ];

  folderStueckActions: VmRowAction[] = [
    {
      key: 'delete',
      icon: 'delete',
    },
  ];

  footerActions: VmRowAction[] = [
    {
      key: 'add',
      icon: 'add',
    },
  ];
  groupSelectorField$: Observable<VmFormField> = this.groupsdata$.pipe(
    distinctUntilChanged(),
    map((groups) => {
      return {
        label: 'Gruppe',
        type: 'select',
        key: nameOf<updateFolder>('name'),
        value: this.#data?.groupId ?? '',
        options: [
          ...groups.map((x) => ({ label: x.name, value: x.groupId + ""})),
        ],
      } as VmFormField;
    }),
    takeUntilDestroyed(),
  );

  folderStueckData$: BehaviorSubject<FolderStueckTeaser[]> = new BehaviorSubject<
    FolderStueckTeaser[]
  >(this.#data?.stueck ?? []);

  changedValues: Dictionary<string> = {};

  constructor() {
    super();
    this.#buttonClickEvents$.pipe(takeUntilDestroyed()).subscribe(async (x) => {
      const patch = convertToPatch<Folder, string>(this.changedValues);
      if (x === 'save') {
        patch.folderId = this.#data?.folderId ?? -1;
        await firstValueFrom(this.#folderService.change$(patch, patch.folderId));
        super.closeDialog(true);
        return;
      }

      if (x === 'create') {
        await firstValueFrom(this.#folderService.create$(patch));
        super.closeDialog(true);
        return;
      }

      if (x === 'close') {
        super.closeDialog(false);
      }
    });
  }

  storeChangedValue(newValue: VmValidFormTypes, key: string): void {
    this.changedValues[key] = newValue as string;
  }
  protected readonly folderNameKey = folderNameKey;
}
