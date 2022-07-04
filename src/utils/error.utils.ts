export type CustomError = { status?: number; message?: string };
export const ERROR_CODES = {
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TIMEOUT: 503,
};

export const getDefaultError = (): CustomError => ({
  status: ERROR_CODES.SERVER_ERROR,
  message: "Internal Server Error",
});

export const generateError = (
  status: number,
  message: string,
  asString: boolean = false
): CustomError | string => {
  return asString ? JSON.stringify({ status, message }) : { status, message };
};

export const validateCustomError = (errString: string): CustomError => {
  let error = {};
  try {
    error = JSON.parse(errString);
  } catch {
    error = getDefaultError();
  }
  return error;
};

export const buildCustomError = (error: any) => {
  let result;
  if (error instanceof Error) {
    result = validateCustomError(error["message"] as string);
  } else {
    result = getDefaultError();
  }
  return result;
};
