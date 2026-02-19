import {
  Component,
  computed, effect,
  input,
  InputSignal,
  output,
  OutputEmitterRef, Signal,
  TemplateRef,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Dictionary } from '@vm-utils';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCheckbox} from '@angular/material/checkbox';
import {BehaviorSubject} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

export type VmColumnType = 'text' | 'date' | 'template'; //| 'boolean' | 'number' ;
export type VmSelectType = 'multi' | 'single' | 'none';

export interface VmColumn<TElement> {
  key: string;
  header: string;
  filterable?: boolean;
  field?: keyof TElement & string;
  type?: VmColumnType;
}

export interface VmGridTemplate {
  keys: string[];
  templateRef: TemplateRef<undefined>;
}

export interface VmRowAction {
  key: string;
  name?: string;
  icon?: string;
}

export interface VmRowClickedEvent<TRow> {
  key: string;
  rowData: TRow;
}

@Component({
  selector: 'vmc-data-grid',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCellDef,
    MatCellDef,
    DatePipe,
    NgTemplateOutlet,
    MatIconButton,
    MatIcon,
    MatCheckbox,
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow, TSelectionKey extends keyof TRow> {
  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<VmColumn<TRow>[]> = input.required();
  rowActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  templates: InputSignal<VmGridTemplate[]> = input<VmGridTemplate[]>([]);
  selectionMode: InputSignal<VmSelectType> = input<VmSelectType>('none');
  selectionKey: InputSignal<TSelectionKey | undefined> = input<TSelectionKey | undefined>(undefined);
  filterTerm: InputSignal<string | undefined> = input<string | undefined>(undefined);

  clickedAction: OutputEmitterRef<VmRowClickedEvent<TRow>> = output();
  selectionChanged: OutputEmitterRef<TSelectionKey[]> = output();

  selection$: BehaviorSubject<TSelectionKey[]> = new BehaviorSubject<TSelectionKey[]>([]);
  selection = toSignal<TSelectionKey[], TSelectionKey[]>(this.selection$, {initialValue: []})
  selectionDict: Signal<Dictionary<boolean>> = computed<Dictionary<boolean>>(() => this.#convertSelectionToDictionary());
  isAllSelected = computed(() => this.#convertAllSelected());

  tableData = new MatTableDataSource();

  displayedColumns = computed(() => this.#mapColumnsToDisplay());
  transformedTemplates = computed(() => this.#mapTemplates());

  constructor() {
    this.selection$
      .pipe(takeUntilDestroyed())
      .subscribe(x => {
        this.selectionChanged.emit(x);
      });

    // Customfilter für DataGrid
    this.tableData.filterPredicate = (row: unknown, filter: string) => {
      const data = row as TRow;
      const filterTerm = filter.toLowerCase();
      const columns = this.columns();
      return columns
        .filter(x => x.filterable ?? false)
        .some(col => {
          if (!col.field) return false;
          const value = data[col.field];
          return value?.toString().toLowerCase().includes(filterTerm);
        });
    }

    effect(() => {
      this.tableData.data = this.dataSource() ?? [];
    });

    effect(() => {
      this.tableData.filter = this.filterTerm() ?? '';
    });
  }

  toggleRowSelection(row: TRow) {
    const selectionKey = this.selectionKey();

    if (selectionKey === undefined) {
      return;
    }

    const key = row[selectionKey] as TSelectionKey;
    const selectionArray = this.selection$.getValue();

    if (selectionArray.includes(key)) {
      this.selection$.next(selectionArray.filter(k => k !== key));
    } else {
      this.selection$.next([...selectionArray, key]);
    }
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection$.next([]);
      return;
    }

    const selectionKey = this.selectionKey();

    if (selectionKey === undefined) {
      return;
    }

    const keys = this.dataSource().map(x => x[selectionKey] as TSelectionKey);
    this.selection$.next(keys);
  }

  #convertAllSelected() {
    const numSelected = this.selection().length;
    const numRows = this.dataSource().length;
    return numSelected === numRows;
  }

  #convertSelectionToDictionary(): Dictionary<boolean> {
    const selection = this.selection();
    const dict: Dictionary<boolean> = {};

    selection.forEach((key) => {
      dict[key.toString()] = true;
    });

    return dict;
  }

  #mapTemplates(): Dictionary<TemplateRef<unknown>> {
    const templatesArray = this.templates();
    const templatesDict: Dictionary<TemplateRef<unknown>> = {};

    templatesArray.forEach((t) => {
      t.keys.forEach((key) => {
        templatesDict[key] = t.templateRef;
      });
    });

    return templatesDict;
  }

  #mapColumnsToDisplay(): string[] {
    const columns = this.columns();
    const actions = this.rowActions();

    const columnsKeys = columns.map((c) => c.key);

    if (actions.length > 0) {
      columnsKeys.push('actions');
    }

    if (this.selectionMode() !== 'none') {
      columnsKeys.unshift('select');
    }

    return columnsKeys;
  }
}
