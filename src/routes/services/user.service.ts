import ResponseI from "../controllers/models/response.model";
import { IAdvertisement } from "../../models/Advertisement";
import { getServiceResponseBase } from "./base.service.utils";
import { IUser, User } from "../../models/User";
import { generateError, ERROR_CODES } from "../../utils/error.utils";
import {
  buildCustomError,
  CustomError,
  getDefaultError,
} from "../../utils/error.utils";

const USER_NOT_FOUND_ERROR = generateError(
  ERROR_CODES.NOT_FOUND,
  "User not found in database"
) as CustomError;

/**
 * @param {AdvertisementsFilters} options
 * @return {Promise}
 */

async function getUsers(): Promise<
  ResponseI<Array<IUser & { _id: any }> | any>
> {
  const serviceResponse: ResponseI<Array<IUser & { _id: any }> | any> =
    getServiceResponseBase();

  try {
    const users: Array<IUser & { _id: any }> = await User.list();
    serviceResponse.data = users;
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function getUserById(
  userId: string
): Promise<ResponseI<(IUser & { _id: any }) | any>> {
  const serviceResponse: ResponseI<(IUser & { _id: any }) | any> =
    getServiceResponseBase();

  try {
    const user = (await User.findById(userId)) as IUser & { _id: any };
    if(user){
      serviceResponse.data = user
    }else{
      serviceResponse.data = USER_NOT_FOUND_ERROR;
      serviceResponse.status = USER_NOT_FOUND_ERROR?.status || 500;
    }
     
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function addFavorite(
  userId: string,
  advertId: string
): Promise<ResponseI<IUser & { _id: any }> | any> {
  const serviceResponse: ResponseI<(IUser & { _id: any }) | any> =
    getServiceResponseBase();
  try {
    const userExists = await checkIfuserExists(userId);
    if (userExists) {
      await User.addAsFavorite(userId, advertId);
      const user = await User.findById(userId).lean();
      serviceResponse.data = user;
    } else {
      serviceResponse.data = USER_NOT_FOUND_ERROR;
      serviceResponse.status = USER_NOT_FOUND_ERROR?.status || 500;
    }
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function removeFavorite(
  userId: string,
  advertId: string
): Promise<ResponseI<(IUser & { _id: any }) | any>> {
  const serviceResponse: ResponseI<(IUser & { _id: any }) | any> =
    getServiceResponseBase();
  try {
    await User.removeFavorite(userId, advertId);
    const user: IUser & { _id: any } = (await User.findById(
      userId
    )) as IUser & { _id: any };

    serviceResponse.data = user;
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function getFavorites(
  userId: string
): Promise<ResponseI<Array<IAdvertisement> | CustomError>> {
  const serviceResponse: ResponseI<Array<IAdvertisement> | CustomError> =
    getServiceResponseBase();

  try {
    const advertisements: Array<IAdvertisement> = (await User.listFavorites(
      userId
    )) as any;
    serviceResponse.data = advertisements;
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function deleteUser(userId: string): Promise<ResponseI<any>> {
  const serviceResponse: ResponseI<any> = getServiceResponseBase();

  try {
    const userExists = await checkIfuserExists(userId);
    if (userExists) {
      await User.deleteOne({ _id: userId });
      serviceResponse.data = { message: "User deleted successfully" };
    } else {
      serviceResponse.data = USER_NOT_FOUND_ERROR;
      serviceResponse.status = USER_NOT_FOUND_ERROR?.status || 500;
    }
  } catch (error) {
    const customError = buildCustomError(error);
    serviceResponse.status = customError.status || 500;
    serviceResponse.data = customError;
  }

  return serviceResponse;
}

async function checkIfuserExists(userId: string): Promise<boolean> {
  let userExists = false;
  const user: IUser & { _id: any } = (await User.findById(
    userId
  ).lean()) as IUser & { _id: any };

  if (user) {
    userExists = true;
  } else {
    userExists = false;
  }
  return userExists;
}

export {
  getUsers,
  getUserById,
  addFavorite,
  removeFavorite,
  getFavorites,
  deleteUser,
};
