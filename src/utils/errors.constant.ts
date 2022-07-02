import { CustomError, ERROR_CODES, generateError } from "./error.utils";

const USER_NOT_FOUND_ERROR = generateError(
  ERROR_CODES.NOT_FOUND,
  "User not found in database"
) as CustomError;

const USERNAME_ALREADY_EXISTS_ERROR = generateError(
  ERROR_CODES.BAD_REQUEST,
  "Username already exists"
) as CustomError;

const EMAIL_ALREADY_EXISTS_ERROR = generateError(
  ERROR_CODES.BAD_REQUEST,
  "Email already exists"
) as CustomError;

const MISSING_FIELDS_ERROR = generateError(
  ERROR_CODES.BAD_REQUEST,
  "Please add all fields"
) as CustomError;

const INVALID_FAVORITE_ADVERTS = generateError(
  ERROR_CODES.BAD_REQUEST,
  "Adverts provided as favorites are invalid"
) as CustomError;

const FAVORITE_ALREADY = generateError(
  ERROR_CODES.BAD_REQUEST,
  "Advert provided is already favorite"
) as CustomError;

export {
  USER_NOT_FOUND_ERROR,
  USERNAME_ALREADY_EXISTS_ERROR,
  EMAIL_ALREADY_EXISTS_ERROR,
  MISSING_FIELDS_ERROR,
  INVALID_FAVORITE_ADVERTS,
  FAVORITE_ALREADY
};
