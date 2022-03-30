import { ApiResponseClass } from './api-response.js';

export class JsonResponseClass extends ApiResponseClass {
  constructor(...args) {
    super(...args);
    this.isJsonResponse = true;
  }
}
export const JsonResponse = (...args) => new JsonResponseClass(...args);
