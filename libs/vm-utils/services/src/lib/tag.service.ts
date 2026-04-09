import { Injectable } from '@angular/core';
import { BaseCrudService, convertMetaDataFromDtos, IMetaData } from '@vm-utils';
import { map, Observable } from 'rxjs';

export interface Tag extends IMetaData {
  tagId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService extends BaseCrudService<Tag> {
  override url = 'tag';
  private tags: Tag[] = [];

  getTagById(tagId: number): Tag | undefined {
    return this.tags.find((Id) => Id.tagId === tagId);
  }
  loadForMyArea$(): Observable<Tag[]> {
    return this.httpClient
      .get<Tag[]>(this.url + '/forMyArea')
      .pipe(map((tag) => convertMetaDataFromDtos(tag)));
  }
}
