export class GenericStatus<T> {
  statusCode?: number;
  message: string;
  data?: T;

  constructor({
    statusCode,
    message,
    data,
  }: {
    statusCode?: number;
    message: string;
    data?: T;
  }) {
    this.statusCode = statusCode || 200;
    this.message = message;
    this.data = data;
  }
}
