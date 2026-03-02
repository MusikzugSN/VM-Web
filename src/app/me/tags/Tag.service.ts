import { Injectable } from '@angular/core';

export interface Tag {
  tagId: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private tags: Tag[] = [];

  public tagListe: Tag[] = [
    { tagId: 1, name: 'Favourite' },
    { tagId: 2, name: 'Üben' },
    { tagId: 3, name: 'Hass' },
  ];

  getTagById(tagId: number): Tag | undefined {
    return this.tags.find((Id) => Id.tagId === tagId);
  }
}
