import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FileData } from '@vm-components';

@Injectable({
  providedIn: 'root',
})
export class NoteViewerSelectionService {
  #files$ = new BehaviorSubject<FileData[]>([]);
  files$ = this.#files$.asObservable();

  setFiles(files: FileData[]): void {
    this.#files$.next(files);
  }
}
