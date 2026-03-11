import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { Dictionary } from '@vm-utils';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export type VmColumnType = 'text' | 'date' | 'date-time' | 'template' | 'converter'; //| 'boolean' | 'number' ;
export type VmSelectType = 'multi' | 'single' | 'none';

export interface VmColumn<TElement> {
  key: string;
  header: string;
  filterable?: boolean;
  sortable?: boolean;
  field?: keyof TElement & string;
  type?: VmColumnType;
  converter?: (rowData: TElement) => Observable<string>;
  footerAsTemplate?: boolean; // das Template muss über -- key + 'Footer' -- bereitgestellt werden
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
  rowData: TRow | null;
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
    MatFooterRowDef,
    MatFooterCell,
    MatFooterRow,
    MatFooterCellDef,
    MatCheckbox,
    MatSortHeader,
    MatSort,
    AsyncPipe,
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow, TSelectionKey extends keyof TRow> {
  readonly #liveAnnouncer = inject(LiveAnnouncer);
  readonly sortElement = viewChild(MatSort);

  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<VmColumn<TRow>[]> = input.required();
  rowActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  footerActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  templates: InputSignal<VmGridTemplate[]> = input<VmGridTemplate[]>([]);
  selectionMode: InputSignal<VmSelectType> = input<VmSelectType>('none');
  selectionKey: InputSignal<keyof TRow | undefined> = input<keyof TRow | undefined>(undefined);
  filterTerm: InputSignal<string | undefined> = input<string | undefined>(undefined);

  clickedAction: OutputEmitterRef<VmRowClickedEvent<TRow>> = output();
  selectionChanged: OutputEmitterRef<TSelectionKey[]> = output();

  selection$: BehaviorSubject<TSelectionKey[]> = new BehaviorSubject<TSelectionKey[]>([]);
  selection = toSignal<TSelectionKey[], TSelectionKey[]>(this.selection$, { initialValue: [] });
  selectionDict: Signal<Dictionary<boolean>> = computed<Dictionary<boolean>>(() =>
    this.#convertSelectionToDictionary(),
  );
  isAllSelected = computed(() => this.#convertAllSelected());

  tableData = new MatTableDataSource<TRow>();

  displayedColumns = computed(() => this.#mapColumnsToDisplay());
  displayFooter = computed(() => this.#mapColumnsWithFooter());
  transformedTemplates = computed(() => this.#mapTemplates());

  constructor() {
    this.selection$.pipe(takeUntilDestroyed()).subscribe((x) => {
      this.selectionChanged.emit(x);
    });

    // custom filter für DataGrid
    this.tableData.filterPredicate = (row: unknown, filter: string): boolean => {
      const data = row as TRow;
      const filterTerm = filter.toLowerCase();
      const columns = this.columns();
      return columns
        .filter((x) => x.filterable ?? false)
        .some((col) => {
          if (!col.field) return false;
          const value = data[col.field];
          return value?.toString().toLowerCase().includes(filterTerm);
        });
    };

    // custom sorting für DataGrid
    this.tableData.sortingDataAccessor = (row: TRow, columnId: string): string => {
      const col = this.columns().find((c) => c.key === columnId);
      if (!col?.field) return '';
      return row[col.field] as unknown as string;
    };

    effect(() => {
      this.tableData.data = this.dataSource() ?? [];
    });

    effect(() => {
      this.tableData.filter = this.filterTerm() ?? '';
    });

    effect(() => {
      const sort = this.sortElement();
      if (sort) {
        this.tableData.sort = sort;
      }
    });
  }

  toggleRowSelection(row: TRow): void {
    const selectionKey = this.selectionKey();

    if (selectionKey === undefined) {
      return;
    }

    const key = row[selectionKey] as TSelectionKey;
    const selectionArray = this.selection$.getValue();

    if (selectionArray.includes(key)) {
      this.selection$.next(selectionArray.filter((k) => k !== key));
    } else {
      this.selection$.next([...selectionArray, key]);
    }
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection$.next([]);
      return;
    }

    const selectionKey = this.selectionKey();

    if (selectionKey === undefined) {
      return;
    }

    const keys = this.dataSource().map((x) => x[selectionKey] as TSelectionKey);
    this.selection$.next(keys);
  }

  #convertAllSelected(): boolean {
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

  #mapColumnsWithFooter(): string[] {
    const columns = this.columns();
    const actions = this.footerActions();

    const columnsFiltered = columns.filter((x) => x.footerAsTemplate).map((x) => x.key);

    if (actions.length > 0) {
      return [...columnsFiltered, 'actions'];
    }

    return columnsFiltered;
  }

  /** Announce the change in sort state for assistive technology. */
  async announceSortChange(sortState: Sort): Promise<void> {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      await this.#liveAnnouncer.announce(`Sortierung ${sortState.direction}beendet`);
    } else {
      await this.#liveAnnouncer.announce('Sortierung gelöscht');
    }
  }
}
