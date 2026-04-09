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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Dictionary } from '@vm-utils';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { BehaviorSubject } from 'rxjs';
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
  converter?: (rowData: TElement) => string;
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
    MatPaginator,
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow, TSelectionKey extends keyof TRow> {
  readonly #liveAnnouncer = inject(LiveAnnouncer);
  readonly sortElement = viewChild(MatSort);
  readonly paginatorElement = viewChild(MatPaginator);

  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<VmColumn<TRow>[]> = input.required();
  rowActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  footerActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  templates: InputSignal<VmGridTemplate[]> = input<VmGridTemplate[]>([]);
  selectionMode: InputSignal<VmSelectType> = input<VmSelectType>('none');
  selectionKey: InputSignal<keyof TRow | undefined> = input<keyof TRow | undefined>(undefined);
  filterTerm: InputSignal<string | undefined> = input<string | undefined>(undefined);
  paginator: InputSignal<number[]> = input<number[]>([]);

  pageSizeOptions = computed(() => {
    const options = this.paginator() ?? [];
    return [
      ...new Set(options.filter((x) => Number.isFinite(x) && x > 0).map((x) => Math.floor(x))),
    ].sort((a, b) => a - b);
  });

  defaultPageSize = computed<number>(() => {
    const options = this.pageSizeOptions();
    if (options.length === 0) {
      return 0;
    }

    const rows = this.dataSource()?.length ?? 0;

    // nächsthöhere Option suchen
    const nextHigher = options.find((x) => x >= rows);

    // wenn gefunden → nehmen
    if (nextHigher !== undefined) {
      return nextHigher;
    }

    // sonst höchste Option zurückgeben
    return options[options.length - 1] ?? 0;
  });

  clickedAction: OutputEmitterRef<VmRowClickedEvent<TRow>> = output();
  selectionChanged: OutputEmitterRef<TSelectionKey[]> = output();

  selection$: BehaviorSubject<TSelectionKey[]> = new BehaviorSubject<TSelectionKey[]>([]);
  selection = toSignal<TSelectionKey[], TSelectionKey[]>(this.selection$, { initialValue: [] });
  selectionDict: Signal<Dictionary<boolean>> = computed<Dictionary<boolean>>(() =>
    this.#convertSelectionToDictionary(),
  );
  isAllSelected = computed(() => this.#convertAllSelected());

  calculatedColumns = computed(() => this.#calcColumnValues());

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
          let value = data[col.field]?.toString();

          if (col.type === 'converter') {
            value = this.calculatedColumns()[`${col.key}-${value}`] ?? value;
          }

          return value?.toLowerCase().includes(filterTerm);
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

    effect(() => {
      const paginator = this.paginatorElement();
      if (paginator) {
        this.tableData.paginator = paginator;
      }
    });

    effect(() => {
      const paginator = this.paginatorElement();
      const defaultPageSize = this.defaultPageSize();

      if (!paginator || defaultPageSize <= 0) {
        return;
      }

      if (paginator.pageSize === defaultPageSize) {
        return;
      }

      const previousPageIndex = paginator.pageIndex;
      paginator.pageSize = defaultPageSize;
      paginator.pageIndex = 0;

      const event: PageEvent = {
        pageIndex: paginator.pageIndex,
        previousPageIndex,
        pageSize: paginator.pageSize,
        length: this.tableData.data.length,
      };

      paginator.page.emit(event);
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

  #calcColumnValues(): Dictionary<string> {
    const columns = this.columns();
    const data = this.dataSource();
    const dict: Dictionary<string> = {};

    columns.forEach((col) => {
      if (col.type == 'converter') {
        data.forEach((row) => {
          if (col.converter) {
            dict[`${col.key}-${row[col.field as keyof TRow]}`] = col.converter(row);
          }
        });
      }
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

  isDateValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    const date = new Date(value as string | number);
    return !Number.isNaN(date.getTime());
  }
}
