import mongoose, { Schema, Document, Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { Advertisement, IAdvertisement } from './Advertisement';

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
  comparePassword: (clearPassword: string) => Promise<string>;
}

//Interfaz para añadir los métodos estáticos
interface IUserModel extends Model<IUser> {
  loadMockedData: (advertisements: Array<IUser>) => number;
  list: (
    filters: UserFilters,
    skip: number,
    limit: number,
    sortBy: string
  ) => Promise<Array<IUser & { _id: any }>>;
  addAsFavorite: (userId: string, advertId: string) => Promise<unknown>;
  removeFavorite: (userId: string, advertId: string) => Promise<unknown>;
  listFavorites: (userId: string) => Promise<unknown>;
  hashPassword: (clearPassword: string) => Promise<string>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  favorites: { type: [Schema.Types.ObjectId], ref: "Advertisement" }, //TODO:
});

//metodo estático
userSchema.statics.hashPassword = function (
  clearPassword: string
): Promise<string> {
  return bcrypt.hash(clearPassword, 7);
};
//método de instancia
userSchema.methods.comparePassword = function (
  clearPassword: string
): Promise<boolean> {
  return bcrypt.compare(clearPassword, this.password);
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
  filters: UserFilters,
  skip: number,
  limit: number,
  sortBy: string
): Promise<Array<IUser & { _id: any }>> {
  const query = User.find(filters);
  query.skip(skip);
  query.limit(limit);
  query.sort(sortBy);
  const result = await query.exec();
  return result;
};

//TODO: PROBAR SI FUNCIONA ESTO
userSchema.statics.addAsFavorite = async function (
  userId: string,
  advertId: string
): Promise<unknown> {
  const query = User.findByIdAndUpdate(userId, {
    $addToSet : { favorites: [advertId] },
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
  });

  const result = await query.exec();
  return result;
};

userSchema.statics.listFavorites = async function (
  userId: string,
): Promise<unknown> {
  const query = User.findById(userId).populate<{favorites: Array<IAdvertisement>}>('favorites').orFail();

  const result = await query.exec();
  return result;
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
