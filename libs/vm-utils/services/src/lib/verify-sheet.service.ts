import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerifySheetService {
  #sheetIds$ = new BehaviorSubject<number[]>([]);
  sheetsIds$ = this.#sheetIds$.asObservable();

  setSheetIds(sheetIds: number[]): void {
    this.#sheetIds$.next(sheetIds);
  }

  removeId(id: number): void {
    this.#sheetIds$.next(this.#sheetIds$.getValue().filter(x => x !== id));
  }

}
