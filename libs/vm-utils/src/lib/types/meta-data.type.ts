export interface IMetaData {
  updatedAt: Date;
  createdAt: Date;
  updatedBy: string;
  createdBy: string;
}

export function convertMetaDataFromDto<TDto extends IMetaData>(data: TDto[]): TDto[] {
  return data.map(
    (dto) =>
      ({
        ...dto,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      }) as TDto,
  );
}

export function mockMetaData(): IMetaData {
  return {
    createdAt: new Date('September 23, 2003 13:36:03'),
    updatedAt: new Date('September 23, 2003 13:36:03'),
    updatedBy: 'Dominiik',
    createdBy: '',
  };
}
