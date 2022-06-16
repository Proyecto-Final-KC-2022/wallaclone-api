import ResponseI from "@/controllers/models/response.model";
import { Advertisement, Filters } from "@/models/Advertisement";
import { IncomingHttpHeaders } from "http";
import { getServiceResponseBase } from "./base.service.utils";
import { IAdvertisement } from '../models/Advertisement';

/**
 * @param {Filters} options
 * @return {Promise}
 */

async function getAdvertisements(options: Filters): Promise<ResponseI<Array<IAdvertisement & { _id: any }>>> {
  const serviceResponse: ResponseI<Array<IAdvertisement & { _id: any }>> = getServiceResponseBase();

  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // serviceResponse = {
  //   status: 200, // Or another success code.
  //   contentType: 'application/json', // Or another content type.
  //   data: {} // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   contentType: 'application/json', // Or another content type.
  //   error: 'Server Error' // Or another error message.
  // });

  try {
    const filters: Filters = {};
    const skip = Number(options.start);
    const sortBy = String(options.sort);

    if (options.tags) {
      filters["tags"] = options.tags;
    }
    if (options.forSale) {
      filters.forSale = options.forSale;
    }
    if (options.name) {
      filters.name = new RegExp(`^${filters.name}`, "i");
    }
    if (options.price) {
      setPriceFilter(options.price as string, filters);
    }
    const advertisements: Array<IAdvertisement & { _id: any }>  = await Advertisement.list(
      filters,
      skip,
      Number(options.limit),
      sortBy
    );
    serviceResponse.data = advertisements; 
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

function setPriceFilter(price: string, filters: Filters): void {
  const rangePriceRegex = /^\d+-\d+$/;
  const greaterThanPriceRegex = /^\d+-$/;
  const lessThanPriceRegex = /^-\d+$/;
  const onlyPriceNumberRegex = /^\d+$/;
  if (rangePriceRegex.test(price)) {
    const gteValue = price.split("-")[0];
    const lteValue = price.split("-")[1];
    filters.price = { $gte: gteValue, $lte: lteValue };
  } else if (greaterThanPriceRegex.test(price)) {
    filters.price = { $gte: price.replace("-", "") };
  } else if (lessThanPriceRegex.test(price)) {
    filters.price = { $lte: price.replace("-", "") };
  } else if (onlyPriceNumberRegex.test(price)) {
    filters.price = price;
  }
}

export { getAdvertisements };
