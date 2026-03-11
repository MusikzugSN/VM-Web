import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {convertMetaDataFromDto, convertMetaDataFromDtos, IMetaData} from '@vm-utils';

export abstract class BaseCrudService<TDto extends IMetaData, TChangeDto = TDto> {
  readonly #httpClient = inject(HttpClient);

  abstract url: string;

  create$(group: Partial<TChangeDto>): Observable<TDto> {
    return this.#httpClient.post<TDto>(this.url, group);
  }

  change$(groupPatch: Partial<TChangeDto>, dtoId: number): Observable<TDto> {
    return this.#httpClient.patch<TDto>(`${this.url}/${dtoId}`, groupPatch);
  }

  delete$(dtoId: number): Observable<boolean> {
    return this.#httpClient.delete<boolean>(`${this.url}/${dtoId}`);
  }

  load$(): Observable<TDto[]> {
    return this.#httpClient
      .get<TDto[]>(`${this.url}`)
      .pipe(map((groups) => convertMetaDataFromDtos(groups)));
  }

  loadById$(id: number): Observable<TDto> {
    return this.#httpClient
      .get<TDto>(`${this.url}/${id}`)
      .pipe(map((groups) => convertMetaDataFromDto(groups)));
  }
}
