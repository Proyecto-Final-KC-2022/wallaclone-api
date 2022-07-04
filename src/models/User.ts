import mongoose, { Schema, Document, Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { Advertisement, IAdvertisement } from "./Advertisement";
import { ERROR_CODES, generateError } from "../utils/error.utils";
const FIELDS_TO_EXCLUDE = { password: 0 };


//Tipo para los filtros que se podrán aplicar sobre los usuarios
export type UserFilters = {
  start?: string;
  limit?: string;
  sort?: string;
  name?: string | RegExp;
};
//Interfaz para tipar los campos del schema
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; //Encriptada
  favorites: Array<Types.ObjectId>; //TODO: hacer la referencia al schema de user
  validatePassword(password: string): Promise<boolean>;
}

//Interfaz para añadir los métodos estáticos
interface IUserModel extends Model<IUser> {
  loadMockedData: (advertisements: Array<IUser>) => number;
  list: (
    filters?: UserFilters,
    skip?: number,
    limit?: number,
    sortBy?: string
  ) => Promise<Array<IUser & { _id: any }>>;
  addAsFavorite: (userId: string, advertId: string) => Promise<unknown>;
  removeFavorite: (userId: string, advertId: string) => Promise<unknown>;
  listFavorites: (userId: string) => Promise<unknown>;
  encryptPassword: (password: string) => Promise<string>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  favorites: { type: [Schema.Types.ObjectId], ref: "Advertisement" }, //TODO:
});

//encriptar contraseña
userSchema.statics.encryptPassword = async (
  password: string
): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.loadMockedData = async function (
  users: Array<IUser>
): Promise<number> {
  for (var i = 0; i < users.length; i++) {
    await new User(users[i]).save();
  }

  return users.length;
};

userSchema.statics.list = async function (
  filters?: UserFilters,
  skip?: number,
  limit?: number,
  sortBy?: string
): Promise<Array<IUser & { _id: any }>> {
  const query = filters
    ? User.find(filters, FIELDS_TO_EXCLUDE).lean()
    : User.find({}, FIELDS_TO_EXCLUDE).lean();
  if (typeof skip === "number") {
    query.skip(skip);
  }
  if (typeof limit === "number") {
    query.limit(limit);
  }
  if (sortBy) {
    query.sort(sortBy);
  }

  const result = await query.exec();
  return result;
};

userSchema.statics.addAsFavorite = async function (
  userId: string,
  advertId: string
): Promise<unknown> {
  const advertisementExists = await Advertisement.findById(advertId);
  if(!advertisementExists){
    throw new Error(generateError(ERROR_CODES.BAD_REQUEST, "User can only add advertisements as favorites", true) as string);
  }
  const query = User.findByIdAndUpdate(userId, {
    $addToSet: { favorites: [advertId] },
  });

  const result = await query.exec();
  return result;
};

userSchema.statics.removeFavorite = async function (
  userId: string,
  advertId: string
): Promise<unknown> {
  const query = User.findByIdAndUpdate(userId, {
    $pullAll: { favorites: [advertId] },
  }).orFail(new Error(generateError(ERROR_CODES.BAD_REQUEST, "Invalid user provided", true) as string));

  const result = await query.exec();
  return result;
};

userSchema.statics.listFavorites = async function (
  userId: string
): Promise<unknown> {
  const query = User.findById(userId, FIELDS_TO_EXCLUDE)
    .populate<{ favorites: Array<IAdvertisement> }>("favorites")
    .orFail().lean();

  const result = await query.exec();
  return result;
};

userSchema.pre("deleteOne", async function (next: any) {
  try {
    const query = this as any;
    //https://mongoosejs.com/docs/tutorials/lean.html
    const deletedUser = await User.findOne(query._conditions).lean(); //lean hace que no instancie un documento completo de mongoose, si no que solo me devuelva el objeto plano de JS
    const advertisementsDeleted = await Advertisement.deleteMany({
      owner: { $in: deletedUser?._id },
    });
    console.log(advertisementsDeleted);
    return next();
  } catch (error) {
    return next(error);
  }
});

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
