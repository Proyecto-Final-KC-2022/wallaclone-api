import mongoose, { Schema, Document, Model } from "mongoose";

export type Filters = {
  start?: string;
  limit?: string;
  sort?: string;
  tags?: string;
  forSale?: string;
  price?: string | { $gte?: string; $lte?: string };
  name?: string | RegExp;
};

export interface IAdvertisement extends Document {
  name: string;
  forSale: boolean;
  price: number;
  tags: Array<string>;
}

interface IAdvertisementModel extends Model<IAdvertisement> {
  loadMockedData: (advertisements: Array<IAdvertisement>) => number;
  list: (
    filters: Filters,
    skip: number,
    limit: number,
    sortBy: string
  ) => Promise<Array<IAdvertisement & { _id: any }>>;
}

const advertisementSchema: Schema<IAdvertisement> = new mongoose.Schema({
  name: { type: String, required: true },
  forSale: { type: Boolean, required: true },
  price: { type: Number, required: true },
  tags: { type: [String], index: true },
});

advertisementSchema.statics.loadMockedData = async function (
  advertisements: Array<IAdvertisement>
): Promise<number> {
  for (var i = 0; i < advertisements.length; i++) {
    await new Advertisement(advertisements[i]).save();
  }

  return advertisements.length;
};

advertisementSchema.statics.list = async function (
    filters: Filters,
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
