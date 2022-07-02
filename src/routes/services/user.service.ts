import ResponseI from "../controllers/models/response.model";
import { IAdvertisement } from "../../models/Advertisement";
import { getServiceResponseBase } from "./base.service.utils";
import { IUser, User } from "../../models/User";

/**
 * @param {AdvertisementsFilters} options
 * @return {Promise}
 */

async function getUsers(): Promise<ResponseI<Array<IUser & { _id: any }>>> {
  const serviceResponse: ResponseI<Array<IUser & { _id: any }>> =
    getServiceResponseBase();

  try {
    const users: Array<IUser & { _id: any }> = await User.list();
    serviceResponse.data = users;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

async function getUserById(
  id: string
): Promise<ResponseI<IUser & { _id: any }>> {
  const serviceResponse: ResponseI<IUser & { _id: any }> =
    getServiceResponseBase();

  try {
    const user = (await User.findById(id)) as IUser & { _id: any };
    serviceResponse.data = user;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

async function addFavorite(
  userId: string,
  advertId: string
): Promise<ResponseI<IUser & { _id: any }>> {
  const serviceResponse: ResponseI<IUser & { _id: any }> =
    getServiceResponseBase();
  try {
    await User.addAsFavorite(userId, advertId);
    const user: IUser & { _id: any } = (await User.findById(
      userId
    )) as IUser & { _id: any };
    serviceResponse.data = user;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

async function removeFavorite(
  userId: string,
  advertId: string
): Promise<ResponseI<IUser & { _id: any }>> {
  const serviceResponse: ResponseI<IUser & { _id: any }> =
    getServiceResponseBase();
  try {
    await User.removeFavorite(userId, advertId);
    const user: IUser & { _id: any } = (await User.findById(
      userId
    )) as IUser & { _id: any };

    serviceResponse.data = user;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

async function getFavorites(
  userId: string
): Promise<ResponseI<Array<IAdvertisement>>> {
  const serviceResponse: ResponseI<Array<IAdvertisement>> =
    getServiceResponseBase();

  try {
    const advertisements: Array<IAdvertisement> = (await User.listFavorites(
      userId
    )) as any;
    serviceResponse.data = advertisements;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
  }

  return serviceResponse;
}

async function deleteUser(userId: string): Promise<ResponseI<any>> {
  const serviceResponse: ResponseI<any> = getServiceResponseBase();

  try {
    const advertisements: Array<IAdvertisement> = (await User.deleteOne({
      _id: userId,
    })) as any;
    serviceResponse.data = advertisements;
  } catch (error) {
    throw {
      status: 500, // Or another error code.
      error: "Server Error", // Or another error message.
    };
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
    serviceResponse.status = 400;
    serviceResponse.data = {
      status: 400,
      message: "Please add all fields",
    };
  }

  const userNameExists = await User.findOne({ name });
  const emailExists = await User.findOne({ email });
  if (userNameExists) {
    serviceResponse.status = 401;
    serviceResponse.data = {
      status: 401,
      message: "Username already exists",
    };
  } else if (emailExists) {
    serviceResponse.status = 403;
    serviceResponse.data = {
      status: 403,
      message: "Email already exists",
    };
  } else {
    try {
      await User.create({
        name: name,
        email: email,
        password: await User.encryptPassword(password),
      });

      serviceResponse.status = 201; //HTTP STATUS CREATED
      serviceResponse.data = { message: "User created successfully" };
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
