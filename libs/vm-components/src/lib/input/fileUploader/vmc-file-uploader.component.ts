import {Component, input, InputSignal, output} from '@angular/core';
import {BehaviorSubject } from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {VmcButton} from '../button/vmc-button.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface FileData {
  file: File;
  path: string;
}

interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
}

interface FileSystemFileEntry extends FileSystemEntry {
  isFile: true;
  isDirectory: false;
  file: (callback: (file: File) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
  isFile: false;
  isDirectory: true;
  createReader: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries: (callback: (entries: FileSystemEntry[]) => void) => void;
}

@Component({
  selector: 'vmc-file-uploader',
  imports: [
    AsyncPipe,
    VmcButton
  ],
  templateUrl: './vmc-file-uploader.component.html',
  styleUrl: './vmc-file-uploader.component.scss',
})
export class VmcFileUploader {
  width: InputSignal<string | undefined> = input<string | undefined>(undefined);
  height: InputSignal<string | undefined> = input<string | undefined>(undefined);
  doNotShowFileNames: InputSignal<boolean> = input<boolean>(true);

  filesChanged = output<FileData[]>();

  #fileData: BehaviorSubject<FileData[]> = new BehaviorSubject<FileData[]>([]);
  fileData$ = this.#fileData.asObservable();

  constructor() {
    this.fileData$
      .pipe(takeUntilDestroyed())
      .subscribe(files => {
      this.filesChanged.emit(files);
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer?.items;
    if (!items) return;

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        const newFiles = await this.readEntry(entry);
        this.mergeFiles(newFiles);
      }
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files).map(f => ({
      file: f,
      path: f.name
    } as FileData));

    this.mergeFiles(newFiles);
  }

  onDirectorySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files).map(f => ({
      file: f,
      path: (f as any).webkitRelativePath
    } as FileData));

    this.mergeFiles(newFiles);
  }

  private mergeFiles(newFiles: FileData[]) {
    const current = this.#fileData.getValue();

    const merged = [...current, ...newFiles];

    const distinct = Array.from(
      new Map(merged.map(f => [f.path, f])).values()
    );

    this.#fileData.next(distinct);
  }

  readEntry(entry: FileSystemEntry): Promise<FileData[]> {
    return new Promise(resolve => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          resolve([{ file: file, path: entry.fullPath }]);
        });

        return;
      }

      if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        const entries: FileSystemEntry[] = [];

        const readBatch = () => {
          reader.readEntries(async (batch: FileSystemEntry[]) => {
            if (batch.length === 0) {
              const results: FileData[] = [];

              for (const e of entries) {
                const sub = await this.readEntry(e);
                results.push(...sub);
              }

              resolve(results);
            } else {
              entries.push(...batch);
              readBatch();
            }
          });
        };

        readBatch();
      }
    });
  }

  fileUploadOpen(input: HTMLInputElement) {
    input.click();
  }

  directoryUploadOpen(input: HTMLInputElement) {
    input.click();
  }

}
