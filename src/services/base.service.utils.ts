import ResponseI from "@/controllers/models/response.model";

export function getServiceResponseBase<T>(): ResponseI<T> {
  return {
    status: 200,
    data: {} as T,
  };
}
