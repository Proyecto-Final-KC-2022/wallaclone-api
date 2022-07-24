import mongoose, { Schema, Document, Model, Types } from "mongoose";
//Interfaz para tipar los campos del schema
export interface IMessage extends Document {
  content: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  creationDate: Date;
  read: boolean;
}

//TODO: Por si se quieren crear métodos estáticos
// interface IMessageModel extends Model<IMessage> {
// }

const messageSchema: Schema<IMessage> = new mongoose.Schema({
  __v: { type: Number, select: false },
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creationDate: { type: Date },
  read: { type: Boolean, required: true },
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
