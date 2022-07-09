import ResponseI from "../controllers/models/response.model";
import {
  Advertisement,
  AdvertisementsFilters,
  IAdvertisement,
} from "../../models/Advertisement";
import { getServiceResponseBase } from "./base.service.utils";
import {
  buildCustomError,
  CustomError,
  ERROR_CODES,
  generateError,
} from "../../utils/error.utils";

const ADVERT_NOT_FOUND_ERROR = generateError(
  ERROR_CODES.NOT_FOUND,
  "Advertisement not found in database"
) as CustomError;

/**
 * @param {AdvertisementsFilters} options
 * @return {Promise}
 */

async function getAdvertisements(
  options: AdvertisementsFilters
): Promise<ResponseI<Array<IAdvertisement & { _id: any }>> | any> {
  const serviceResponse: ResponseI<Array<IAdvertisement & { _id: any }> | any> =
    getServiceResponseBase();

  try {
    const filters: AdvertisementsFilters = {};
    if (options.start) {
      filters.start = options.start;
    }
    if (options.sort) {
      filters.sort = String(options.sort);
    }
    if (options.limit) {
      filters.limit = options.limit;
    }

    if (options.tags?.length > 0) {
      filters["tags"] = { $all: options.tags };
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
    const advertisements: Array<IAdvertisement & { _id: any }> =
      await Advertisement.list(filters);
    serviceResponse.data = advertisements;
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.data = customError;
    serviceResponse.status = customError?.status || 500;
  }

  return serviceResponse;
}

async function geAdvertisementById(
  id: string
): Promise<ResponseI<IAdvertisement & { _id: any }> | any> {
  const serviceResponse: ResponseI<(IAdvertisement & { _id: any }) | any> =
    getServiceResponseBase();

  try {
    const advertisement = (await Advertisement.findById(
      id
    )) as IAdvertisement & { _id: any };

    if (advertisement) {
      serviceResponse.data = advertisement;
    } else {
      serviceResponse.data = ADVERT_NOT_FOUND_ERROR;
      serviceResponse.status = ADVERT_NOT_FOUND_ERROR.status || 500;
    }
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.data = customError;
    serviceResponse.status = customError?.status || 500;
  }

  return serviceResponse;
}

async function deleteAdvertisements(
  ids: Array<string>
): Promise<ResponseI<IAdvertisement & { _id: any }>> {
  const serviceResponse: ResponseI<any> = getServiceResponseBase();

  try {
    const advertisementsFound = await Advertisement.find({
      _id: { $in: ids },
    }).lean();
    if (advertisementsFound?.length > 0) {
      const advertisementsDeleted = await Advertisement.deleteMany({
        _id: { $in: ids },
      });
      serviceResponse.data = {
        status: 200,
        message: `Succesfully deleted ${advertisementsDeleted?.deletedCount} advertisements`,
      };
    } else {
      const customError = generateError(
        ERROR_CODES.BAD_REQUEST,
        "No valid advertisements to delete were provided"
      ) as CustomError;
      serviceResponse.data = customError;
      serviceResponse.status = customError.status || 500;
    }
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.data = customError;
    serviceResponse.status = customError?.status || 500;
  }

  return serviceResponse;
}

export {
  getAdvertisements,
  geAdvertisementById,
  deleteAdvertisements,
  createAdvertisement,
};

// async function checkIfAdvertExists(advertId: string): Promise<boolean> {
//   let advertExists = false;
//   const advert: IAdvertisement & { _id: any } = (await Advertisement.findById(
//     advertId
//   ).lean()) as IAdvertisement & { _id: any };

//   if (advert) {
//     advertExists = true;
//   } else {
//     advertExists = false;
//   }
//   return advertExists;
// }

async function createAdvertisement(
  name: string,
  image: string,
  description: string,
  forSale: boolean,
  price: number,
  tags: any,
  creationDate: string = new Date(Date.now()).toISOString(),
  owner: any,
  preOrdered: boolean = false,
  sold: boolean = false
): Promise<ResponseI<Array<IAdvertisement & { _id: any }>>> {
  const serviceResponse: any = getServiceResponseBase();

  try {
    const advertisement: IAdvertisement & { _id: any } =
      (await Advertisement.create({
        name,
        image,
        description,
        forSale,
        price,
        tags,
        creationDate,
        owner,
        preOrdered,
        sold,
      })) as IAdvertisement & { _id: any };

    serviceResponse.data = advertisement;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }
  return serviceResponse;
}

function setPriceFilter(price: string, filters: AdvertisementsFilters): void {
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
