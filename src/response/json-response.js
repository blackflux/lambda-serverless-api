import { ApiResponse } from './api-response.js';

export class JsonResponse extends ApiResponse {
  constructor(...args) {
    super(...args);
    this.isJsonResponse = true;
  }
}
export const JsonResponseFn = (...args) => new JsonResponse(...args);
