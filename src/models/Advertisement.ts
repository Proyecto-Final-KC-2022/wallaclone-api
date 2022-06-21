import mongoose, { Schema, Document, Model, Types, ObjectId } from "mongoose";
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
  creationDate: string;
  owner: Types.ObjectId;
  preOrdered: boolean;
  sold: boolean;
}

//Interfaz para añadir los métodos estáticos
interface IAdvertisementModel extends Model<IAdvertisement> {
  loadMockedData: (advertisements: Array<IAdvertisement>) => number;
  list: (
    filters: AdvertisementsFilters,
    skip: number,
    limit: number,
    sortBy: string
  ) => Promise<Array<IAdvertisement & { _id: any }>>;
  listAdvertsByUser: (userId: string) => Promise<Array<IAdvertisement & { _id: any }>>;
}

const advertisementSchema: Schema<IAdvertisement> = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  forSale: { type: Boolean, required: true },
  price: { type: Number, required: true },
  tags: { type: [String], index: true },
  creationDate: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  preOrdered: { type: Boolean, required: true },
  sold: { type: Boolean, required: true },
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
  filters: AdvertisementsFilters,
  skip: number,
  limit: number,
  sortBy: string
): Promise<Array<IAdvertisement & { _id: any }>> {
  const query = Advertisement.find(filters);
  query.skip(skip);
  query.limit(limit);
  query.sort(sortBy);
  const result = await query.exec();
  return result;
};
export const Advertisement = mongoose.model<
  IAdvertisement,
  IAdvertisementModel
>("Advertisement", advertisementSchema);
