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
