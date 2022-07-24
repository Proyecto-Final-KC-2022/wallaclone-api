import mongoose, { Schema, Document, Model, Types } from "mongoose";
//Interfaz para tipar los campos del schema
export interface IChat extends Document {
  advertId: Types.ObjectId;
  messages: Array<Types.ObjectId>;
  members: Array<Types.ObjectId>;
}

//TODO: Por si se quieren crear métodos estáticos
// interface IChatModel extends Model<IChat> {
// }

const chatSchema: Schema<IChat> = new mongoose.Schema({
  __v: { type: Number, select: false },
  advertId: {
    type: Schema.Types.ObjectId,
    ref: "Advertisement",
    required: true,
  },
  messages: { type: [Schema.Types.ObjectId], ref: "Message" },
  members: { type: [Schema.Types.ObjectId], ref: "User" },
});

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
