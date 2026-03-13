import {Component, effect, ElementRef, input, InputSignal, output, ViewChild} from '@angular/core';
import {VmSelectOption} from '@vm-components';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'vmc-select',
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    AsyncPipe
  ],
  templateUrl: './vmc-select.component.html',
  styleUrl: './vmc-select.component.scss',
})
export class VmcSelect {
  label: InputSignal<string> = input.required()
  enableSearch: InputSignal<boolean> = input<boolean>(false);
  options: InputSignal<VmSelectOption[]> = input.required();
  value: InputSignal<string | undefined> = input<string | undefined>(undefined);
  hideIfNotSelected: InputSignal<string[]> = input<string[]>([]);

  inputChanged = output<string>();

  #currentValue: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined)

  #filterString$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  #filteredOptions$: BehaviorSubject<VmSelectOption[]> = new BehaviorSubject<VmSelectOption[]>([]);

  filteredOptions$: Observable<VmSelectOption[]> = combineLatest([this.#filterString$, this.#filteredOptions$, toObservable(this.hideIfNotSelected), this.#currentValue])
    .pipe(
      map(([filterString, options, hideIfNotSelected, currentValue]) => {
      const valuesToHide = hideIfNotSelected.filter(x => x !== currentValue);
      let optionsToShow = options;

      if (valuesToHide.length > 0) {
        optionsToShow = optionsToShow.filter(option => !valuesToHide.includes(option.value));
      }

      if (filterString) {
        optionsToShow = optionsToShow.filter(option => this.#filter(option, filterString));
      }
      return optionsToShow;
    }));

  constructor() {
    effect(() => {
      this.#filteredOptions$.next(this.options());
    });

    effect(() => {
      this.#currentValue.next(this.value());
    });
  }

  #filter(element: VmSelectOption, filterString: string): boolean {
    return element.label.toLowerCase().includes(filterString.toLowerCase());
  }

  genericCallChangeEvent(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.#filterString$.next(value);
  }

  selectCallChangeEvent(event: MatSelectChange): void {
    this.inputChanged.emit(event.value);
    this.#currentValue.next(event.value);
  }


  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  onOpened(opened: boolean) {
    if (opened) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    // Nur SPACE blockieren
    if (event.code === 'Space' || event.key === ' ') {
      event.stopPropagation(); // verhindert Select-Interaktion
      return; // aber Input bekommt das Leerzeichen trotzdem
    }

    // Alle anderen Keys sollen normal funktionieren
  }


}
