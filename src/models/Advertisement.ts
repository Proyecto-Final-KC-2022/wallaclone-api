import { NextFunction } from "express";
import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  ObjectId,
  Query,
} from "mongoose";
import { User } from "./User";
//Tipo para los filtros que se podrán aplicar sobre los anuncios
export type AdvertisementsFilters = {
  start?: string;
  limit?: string;
  sort?: string;
  tags?: string;
  forSale?: string;
  price?: string | { $gte?: string; $lte?: string };
  name?: string | RegExp;
};

//Interfaz para tipar los campos del schema
export interface IAdvertisement extends Document {
  name: string;
  image: string;
  description: string;
  forSale: boolean;
  price: number;
  tags: Types.Array<string>;
  creationDate: Date;
  owner: Types.ObjectId;
  preOrdered: boolean;
  sold: boolean;
}

//Interfaz para añadir los métodos estáticos
interface IAdvertisementModel extends Model<IAdvertisement> {
  loadMockedData: (advertisements: Array<IAdvertisement>) => number;
  list: (
    filters: AdvertisementsFilters
  ) => Promise<Array<IAdvertisement & { _id: any }>>;
  listAdvertsByUser: (
    userId: string
  ) => Promise<Array<IAdvertisement & { _id: any }>>;
}

const advertisementSchema: Schema<IAdvertisement> = new mongoose.Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String, required: true },
  forSale: { type: Boolean, required: true },
  price: { type: Number, required: true },
  tags: { type: [String] },
  creationDate: { type: Date },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  preOrdered: { type: Boolean },
  sold: { type: Boolean },
});

advertisementSchema.statics.loadMockedData = async function (
  advertisements: Array<IAdvertisement>
): Promise<number> {
  for (var i = 0; i < advertisements.length; i++) {
    await new Advertisement(advertisements[i]).save();
  }

  return advertisements.length;
};

advertisementSchema.statics.listAdvertsByUser = async function (
  userId: string
): Promise<Array<IAdvertisement & { _id: any }>> {
  const query = Advertisement.find({ owner: userId });
  const result = await query.exec();
  return result;
};

advertisementSchema.statics.list = async function (
  filters?: AdvertisementsFilters
): Promise<Array<IAdvertisement & { _id: any }>> {
  const query = Advertisement.find(filters).sort({ creationDate: -1 });
  if (filters.start) {
    query.skip(Number(filters.start));
  }
  if (filters.limit) {
    query.limit(Number(filters.limit));
  }
  if (filters.sort) {
    query.sort(filters.sort);
  }
  const result = await query.exec();
  return result;
};

advertisementSchema.pre("deleteMany", async function (next: any) {
  try {
    const query = this as any;
    //https://mongoosejs.com/docs/tutorials/lean.html
    let deletedAdverts = await Advertisement.find(query._conditions).lean(); //lean hace que no instancie un documento completo de mongoose, si no que solo me devuelva el objeto plano de JS
    deletedAdverts.forEach(async (advert) => {
      const usersWithAdAsFavorite = await User.find({
        favorites: { $all: [advert._id] },
      }).lean();
      if (usersWithAdAsFavorite && usersWithAdAsFavorite.length > 0) {
        usersWithAdAsFavorite.forEach(async (user) => {
          await User.removeFavorite(user._id, advert._id);
        });
      }
    });
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

export const Advertisement = mongoose.model<
  IAdvertisement,
  IAdvertisementModel
>("Advertisement", advertisementSchema);
