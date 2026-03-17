import { Injectable } from '@angular/core';
import { BaseCrudService, IMetaData, mockMetaData } from '@vm-utils';

export interface Tag extends IMetaData{
  tagId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService extends BaseCrudService<Tag> {
  override url = 'tag';
  private tags: Tag[] = [];

  public tagListe: Tag[] = [
    { tagId: 1, name: 'Favourite', ...mockMetaData() },
    { tagId: 2, name: 'Üben', ...mockMetaData() },
    { tagId: 3, name: 'Hass', ...mockMetaData() },
  ];

  getTagById(tagId: number): Tag | undefined {
    return this.tags.find((Id) => Id.tagId === tagId);
  }
}
