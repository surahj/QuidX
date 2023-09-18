export class ErrorResponse extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public error?: any,
  ) {
    super(message || 'Error');
    this.message = message || 'Error';
    this.statusCode = statusCode;
  }
}
