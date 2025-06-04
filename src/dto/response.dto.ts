export class ResponseDto<T> {
  total: number;
  items: T[];
  page?: number;
  take?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
