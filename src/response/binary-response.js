import { ApiResponse } from './api-response.js';

export class BinaryResponse extends ApiResponse {
  constructor(...args) {
    super(...args);
    this.isBinaryResponse = true;
  }
}
export const BinaryResponseFn = (...args) => new BinaryResponse(...args);
