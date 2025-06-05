export class FindManyDto<T> {
  total: number;
  items: T[];
}

export class ResponseDto<T> extends FindManyDto<T> {
  page?: number;
  take?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
