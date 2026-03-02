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
    createdAt: new Date('24.09.2003'),
    updatedAt: new Date('24.09.2003'),
    updatedBy: '',
    createdBy: '',
  };
}
