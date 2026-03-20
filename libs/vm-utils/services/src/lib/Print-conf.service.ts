import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData } from '@vm-utils';

export interface Printconf extends IMetaData {
  printConfigId: number;
  pageCount: number;
  mode: Mode;
  duplex: Duplex;
  fileFormat: number;
}
export enum Mode {
  Exact = 0,
  Over = 1,
  Under = 2
}
export enum Duplex {
  No = 0,
  Long = 1,
  Short = 2,
}

@Injectable({
  providedIn: 'root',
})

export class PrintconfService extends BaseCrudService<Printconf> {
  override url: string = 'printconf';
}
