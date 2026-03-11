import {Component, effect, ElementRef, input, InputSignal, output, ViewChild} from '@angular/core';
import {VmSelect, VmSelectOption} from '@vm-components';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';

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
  formField: InputSignal<VmSelect> = input.required();

  inputChanged = output<string>();

  #filterString$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  #filteredOptions$: BehaviorSubject<VmSelectOption[]> = new BehaviorSubject<VmSelectOption[]>([]);

  filteredOptions$: Observable<VmSelectOption[]> = combineLatest([this.#filterString$, this.#filteredOptions$])
    .pipe(map(([filterString, options]) => {
      if (!filterString) {
        return options;
      }
      return options.filter(option => this.#filter(option, filterString));
    }))

  constructor() {
    effect(() => {
      this.#filteredOptions$.next(this.formField().options);
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
