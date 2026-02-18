import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  TemplateRef,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatFooterCell, MatFooterCellDef, MatFooterRow, MatFooterRowDef,
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

export type VmColumnType = 'text' | 'date' | 'template'; //| 'boolean' | 'number' ;

export interface VmColumn<TElement> {
  key: string;
  header: string;
  field?: keyof TElement & string;
  type?: VmColumnType;
  footerAsTemplate?: boolean; // das Template muss über -- key + 'Header' -- bereitgestellt werden
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
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow> {
  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<VmColumn<TRow>[]> = input.required();
  rowActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  footerActions: InputSignal<VmRowAction[]> = input<VmRowAction[]>([]);
  templates: InputSignal<VmGridTemplate[]> = input<VmGridTemplate[]>([]);

  clickedAction: OutputEmitterRef<VmRowClickedEvent<TRow>> = output();

  tableData = computed(() => new MatTableDataSource(this.dataSource()));
  displayedColumns = computed(() => this.#mapColumnsToDisplay());
  displayFooter = computed(() => this.#mapColumnsWithFooter());
  transformedTemplates = computed(() => this.#mapTemplates());

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

    const columnsFiltered = columns.map((c) => c.key)

    if (actions.length > 0) {
      return [...columnsFiltered, 'actions'];
    }

    return columnsFiltered;
  }

  #mapColumnsWithFooter(): string[] {
    const columns = this.columns();
    const actions = this.footerActions();

    const columnsFiltered = columns
      .filter((x) => x.footerAsTemplate)
      .map((x) => x.key);

    if (actions.length > 0) {
      return [...columnsFiltered, 'actions'];
    }

    return columnsFiltered;
  }
}
