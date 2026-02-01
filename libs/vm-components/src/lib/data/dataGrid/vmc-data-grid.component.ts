import {Component, computed, input, InputSignal, output, OutputEmitterRef, TemplateRef} from '@angular/core';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from '@angular/material/table';
import {VmcIconButton} from '../../input/iconButton/vmc-icon-button.component';
import {DatePipe, NgTemplateOutlet} from '@angular/common';
import {Dictionary} from '@vm-utils';

export type VmColumnType = 'text'| 'date' | 'template'; //| 'boolean' | 'number' ;

export interface IColumn<TElement> {
  key: string;
  header: string;
  field: keyof TElement & string;
  type?: VmColumnType;
}

export interface ITemplate {
  keys: string[];
  templateRef: TemplateRef<any>;
}

export interface IRowAction {
  key: string;
  name?: string;
  icon?: string;
}

export interface IRowClickedEvent<TRow> {
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
    VmcIconButton,
    DatePipe,
    NgTemplateOutlet
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow> {

  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<IColumn<TRow>[]> = input.required();
  rowActions: InputSignal<IRowAction[]> = input<IRowAction[]>([]);
  templates: InputSignal<ITemplate[]> = input<ITemplate[]>([]);

  onAction: OutputEmitterRef<IRowClickedEvent<TRow>> = output();

  tableData = computed(() => new MatTableDataSource(this.dataSource()))
  displayedColumns = computed(() => this.#mapColumnsToDisplay());
  transformedTemplates = computed(() => this.#mapTemplates());

  #mapTemplates(): Dictionary<TemplateRef<any>> {
    const templatesArray = this.templates();
    const templatesDict: Dictionary<TemplateRef<any>> = {};

    templatesArray.forEach(t => {
      t.keys.forEach(key => {
        templatesDict[key] = t.templateRef;
      });
    });

    return templatesDict;
  }

  #mapColumnsToDisplay() {
    const columns = this.columns();
    const actions = this.rowActions();

    if (actions.length > 0) {
      return [...columns.map(c => c.key), 'actions'];
    }

    return columns.map(c => c.key);
  }
}
