import {Component, computed, inject, input, InputSignal, output} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {
  VmcDataGrid,
  VmcInputField,
  VmColumn,
  VmcToolbar,
  VmFormField,
  VmInputField,
  VmRowAction,
  VmRowClickedEvent,
  VmSelectOption,
  VmToolbarItem,
  VmValidFormTypes,
} from '@vm-components';
import { DownloadFileService } from './download-file.service';
import { VmpNotesFullpageDialogService } from './vmp-notes-fullPage-dialog.service';
import { PermissionService, PermissionType, VoiceService } from '@vm-utils/services';
import {toSignal} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';
import { Router } from '@angular/router';

export interface AllNotesData {
  notesId: number;
  name: string;
  composer: string;
  folders: string;
  link: string;
  pageCount: number;
  voice: string;
}

@Component({
  selector: 'vmp-notes-full-page',
  imports: [VmcDataGrid, VmcInputField, VmcToolbar, AsyncPipe],
  templateUrl: './vmp-notesFullPage.component.html',
  styleUrl: './vmp-notesFullPage.component.scss',
  standalone: true,
})
export class VmpNotesFullPageComponent {
  data: InputSignal<AllNotesData[]> = input.required();
  selectedVoiceIds = input<number[]>([]);
  buttonClicked = output<VmRowClickedEvent<AllNotesData>>();
  itemAdded = output<boolean>();
  voiceFilterChanged = output<number[]>();

  readonly #printService = inject(VmpNotesFullpageDialogService);
  readonly #downloadFileService = inject(DownloadFileService);
  readonly #voiceService = inject(VoiceService);
  readonly #router = inject(Router);
  readonly #permissionService = inject(PermissionService);

  canUpdateValidateNotes = toSignal(
    this.#permissionService.hasPermission$(PermissionType.UpdateValidateNotes),
    { initialValue: false },
  );
  canDeleteScore = toSignal(this.#permissionService.hasPermission$(PermissionType.DeleteScore), {
    initialValue: false,
  });

  #voices = toSignal(this.#voiceService.load$({ includeInstrumentName: true }), {
    initialValue: [],
  });

  #selectedIds$ = new BehaviorSubject<number[]>([]);

  rowActions = computed<VmRowAction[]>(() => {
    const currentUrl = this.#router.url;
    if (currentUrl.startsWith('/me')) {
      return [];
    }

    const disableEdit =
      currentUrl.startsWith('/scores/unverified') || currentUrl.startsWith('/scores/folders');
    const isUnverified = currentUrl.startsWith('/scores/unverified');
    const canCheckInUnverified = this.canUpdateValidateNotes();
    const canDeleteInUnverified = this.canDeleteScore();

    return [
      { key: 'download', icon: 'file_download' },
      ...(isUnverified && canCheckInUnverified ? [{ key: 'check', icon: 'fact_check'}] : []),
      ...(disableEdit ? [] : [{ key: 'print', icon: 'print' }]),
      ...(disableEdit ? [] : [{ key: 'edit', icon: 'edit' }]),
      ...(isUnverified
        ? canDeleteInUnverified
          ? [{ key: 'delete', icon: 'delete' }]
          : []
        : [{ key: 'delete', icon: 'delete' }]),
      { key: 'tag', icon: 'tag' },
    ];
  });

  filter = computed<VmFormField>(() => {
    const voiceOptions = this.#voices().map(
      (v) =>
        ({ label: v.instrumentName + ' ' + v.name, value: v.voiceId.toString() }) as VmSelectOption,
    );

    return {
      key: 'voiceSelect',
      type: 'select',
      label: 'Filter',
      options: voiceOptions,
      multiple: true,
      value: this.selectedVoiceIds().map((id) => id.toString()),
    };
  });

  async execAction(action: VmRowClickedEvent<AllNotesData>): Promise<void> {
    if (action.rowData === null) {
      return;
    }

    if (action.key === 'download') {
      this.#downloadFiles([action.rowData.notesId]);
      return;
    }

    if (action.key === 'print') {
      const ids = [action.rowData.notesId];
      await this.#printService.printSingleWithSystemDialog(ids);
      return;
    }

    if (action.key === 'check') {
      await this.#printService.openVerifyDialog();
      return;
    }

    if (action.key === 'tag') {
      await this.#printService.openTagDialog(
        action.rowData.notesId,
        action.rowData.name,
        action.rowData.voice,
      );
      return;
    }

    this.buttonClicked.emit(action);
  }

  toolbarItems$: Observable<VmToolbarItem[]> = this.#selectedIds$.pipe(
    map((x) => {
      const toolbarItems: VmToolbarItem[] = [];
    if (this.#router.url.startsWith('/scores/folders')) {
      toolbarItems.push({
          key: 'addNotes',
          icon: 'add',
          label: 'Notenblatt hinzufügen',
          action: async (): Promise<void> => {
            const result = await this.#printService.openAddNoteSheetDialog();
            if (result) this.itemAdded.emit(true);
          },
        });
      }
      if (this.#router.url.startsWith('/scores/folders')) {
        toolbarItems.push({
          key: 'addMoreNotes',
          icon: 'add',
          label: 'Hochladen und aufteilen von Notenblättern',
          action: async (): Promise<void> => {
            const result = await this.#printService.openAddMoreNoteSheetDialog();
            if (result) this.itemAdded.emit(true);
          },
        });
      }
      if (this.#router.url.startsWith('/scores/unverified') && this.canUpdateValidateNotes()) {
      toolbarItems.push({
        key: 'check',
        icon: 'fact_check',
        label: 'Prüfen',
        action: async (): Promise<void> => {
          await this.#printService.openVerifyDialog();
        },
      });
    }
    if (this.#router.url.startsWith('/scores/folders') && x.length > 0) {
      toolbarItems.push(

          {key: 'download',
          icon: 'file_download',
          label: 'Herunterladen',
          action: async (): Promise<void> => {
            this.downloadFile();
          },
        },
        {
          key: 'drucken',
          icon: 'print',
          label: 'Drucken',

          action: async (): Promise<void> => {
            const selectedIds = this.#selectedIds$.getValue();

            if (selectedIds.length === 1) {
              await this.#printService.printSingleWithSystemDialog(selectedIds);
              return;
            }

            await this.#printService.openPrintDialog(selectedIds);},
          },
        );
      }

      return toolbarItems;
    }),
  );

  suchleiste: VmInputField = {
    key: 'searchbar',
    type: 'search',
    label: 'Suchen',
  };

  filterSelectionChange(event: VmValidFormTypes): void {
    if (Array.isArray(event)) {
      const ids = (event as Array<string | number>).map(v => Number(v));
      this.voiceFilterChanged.emit(ids);
    } else if (event === null || event === undefined || event === '') {
      this.voiceFilterChanged.emit([]);
    } else {
      this.voiceFilterChanged.emit([Number(event)]);
    }
  }

  columns: VmColumn<AllNotesData>[] = [
    { key: 'name', header: 'Name', field: 'name', filterable: true },
    { key: 'voiceName', header: 'Stimme', field: 'voice' },
    { key: 'composer', header: 'Komponist', field: 'composer', filterable: true },
    { key: 'folders', header: 'Mappen', field: 'folders', filterable: true },
    { key: 'pageCount', header: 'Seitenanzahl', field: 'pageCount' },
  ];

  public downloadFile(): void {
    const selectedIds = this.#selectedIds$.getValue();
    this.#downloadFiles(selectedIds);
  }

  #downloadFiles(ids: number[]): void {
    this.#downloadFileService.downloadFile(ids).subscribe((response) => {
      const headerName = response.headers
        .get('content-disposition')
        ?.split(';')
        .map((x) => x.trim())
        .find((x) => x.startsWith('filename='))
        ?.split('=')[1]
        ?.replace(/"/g, '');

      const fileName = headerName ?? 'notenblaetter.pdf';

      const blob: Blob = response.body as Blob;
      const a = document.createElement('a');
      a.download = fileName;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  selectionChanged(event: number[]): void {
    this.#selectedIds$.next(event);
  }
}
