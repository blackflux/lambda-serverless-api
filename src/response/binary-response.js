import { ApiResponseClass } from './api-response.js';

export class BinaryResponseClass extends ApiResponseClass {
  constructor(...args) {
    super(...args);
    this.isBinaryResponse = true;
  }
}
export const BinaryResponse = (...args) => new BinaryResponseClass(...args);
