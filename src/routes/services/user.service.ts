import ResponseI from "../controllers/models/response.model";
import { IAdvertisement } from "../../models/Advertisement";
import { getServiceResponseBase } from "./base.service.utils";
import { IUser, User } from "../../models/User";
import {
  buildCustomError,
  CustomError
} from "../../utils/error.utils";
import { EMAIL_ALREADY_EXISTS_ERROR, FAVORITE_ALREADY, INVALID_FAVORITE_ADVERTS, MISSING_FIELDS_ERROR, USERNAME_ALREADY_EXISTS_ERROR, USER_NOT_FOUND_ERROR } from "@/utils/errors.constant";



const FIELDS_TO_EXCLUDE = { password: 0 };

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
    const user = (await User.findById(
      userId,
      FIELDS_TO_EXCLUDE
    ).lean()) as IUser & { _id: any };
    if (user) {
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

async function addFavorite(
  userId: string,
  advertId: string
): Promise<ResponseI<IUser & { _id: any }> | any> {
  const serviceResponse: ResponseI<(IUser & { _id: any }) | any> =
    getServiceResponseBase();
  try {
    const userExists = await checkIfuserExists(userId);
    if (userExists) {
      const { favorites } = (await User.listFavorites(userId)) as IUser;
      const alreadyIsFavorite = favorites?.find(
        (e) => e._id?.toString() === advertId
      );
      if (alreadyIsFavorite) {
        serviceResponse.data = FAVORITE_ALREADY;
        serviceResponse.status = FAVORITE_ALREADY?.status || 500;
      } else {
        await User.addAsFavorite(userId, advertId);
        const user = await User.findById(userId, FIELDS_TO_EXCLUDE).lean();
        serviceResponse.data = user;
      }
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
    const deletedFavorites = await User.removeFavorite(userId, advertId);
    if (!deletedFavorites) {
      serviceResponse.data = INVALID_FAVORITE_ADVERTS;
      serviceResponse.status = INVALID_FAVORITE_ADVERTS?.status || 500;
    } else {
      const user: IUser & { _id: any } = (await User.findById(
        userId,
        FIELDS_TO_EXCLUDE
      )) as IUser & { _id: any };

      serviceResponse.data = user;
    }
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

async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<any> {
  const serviceResponse: ResponseI<
    | (IUser & {
        _id: any;
      })
    | any
  > = getServiceResponseBase();

  if (!name || !email || !password) {
    serviceResponse.data = MISSING_FIELDS_ERROR;
    serviceResponse.status = MISSING_FIELDS_ERROR?.status || 400;
  }

  const userNameExists = await User.findOne({ name }).lean();
  const emailExists = await User.findOne({ email }).lean();
  if (userNameExists) {
    serviceResponse.data = USERNAME_ALREADY_EXISTS_ERROR;
    serviceResponse.status = USERNAME_ALREADY_EXISTS_ERROR?.status || 400;
  } else if (emailExists) {
    serviceResponse.data = EMAIL_ALREADY_EXISTS_ERROR;
    serviceResponse.status = EMAIL_ALREADY_EXISTS_ERROR?.status || 400;
  } else {
    try {
      await User.create({
        name: name,
        email: email,
        password: await User.encryptPassword(password),
      });

      serviceResponse.status = 201; //HTTP STATUS CREATED
      serviceResponse.data = {
        code: 201,
        message: "User created successfully",
      };
    } catch (error) {
      throw {
        status: 500,
        error: "Server Error",
      };
    }
  }

  return serviceResponse;
}

export {
  getUsers,
  getUserById,
  addFavorite,
  removeFavorite,
  getFavorites,
  deleteUser,
  registerUser,
};

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
