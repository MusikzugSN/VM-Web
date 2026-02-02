import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {convertMetaDataFromDto, IMetaData} from '@vm-utils';

export abstract class BaseCrudService<TDto extends IMetaData> {
  readonly #httpClient = inject(HttpClient);

  abstract url:string;

  create$(group: Partial<TDto>): Observable<TDto> {
    return this.#httpClient.post<TDto>(this.url, group);
  }

  change$(groupPatch: Partial<TDto>, dtoId: number): Observable<TDto> {
    return this.#httpClient.patch<TDto>(`${this.url}/${dtoId}`, groupPatch);
  }

  delete$(dtoId: number): Observable<boolean> {
    return this.#httpClient.delete<boolean>(`${this.url}/${dtoId}`);
  }

  load$(): Observable<TDto[]> {
    return this.#httpClient
      .get<TDto[]>(`${this.url}`)
      .pipe(map((groups) => convertMetaDataFromDto(groups)));
  }
}
