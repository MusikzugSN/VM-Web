import {Component, computed, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
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

export interface IColumn<TElement> {
  key: string;
  header: string;
  field: keyof TElement & string;
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
    VmcIconButton
  ],
  templateUrl: './vmc-data-grid.component.html',
  styleUrl: './vmc-data-grid.component.scss',
})
export class VmcDataGrid<TRow> {

  dataSource: InputSignal<TRow[]> = input.required();
  columns: InputSignal<IColumn<TRow>[]> = input.required();
  rowActions: InputSignal<IRowAction[]> = input<IRowAction[]>([]);

  onAction: OutputEmitterRef<IRowClickedEvent<TRow>> = output();

  tableData = computed(() => new MatTableDataSource(this.dataSource()))
  displayedColumns = computed(() => this.#mapColumnsToDisplay());


  #mapColumnsToDisplay() {
    const columns = this.columns();
    const actions = this.rowActions();

    if (actions.length > 0) {
      return [...columns.map(c => c.key), 'actions'];
    }

    return columns.map(c => c.key);
  }

}
