import mongoose from "mongoose";

const URL_DATABASE =
  process.env.MONGODB_CONNSTR || "mongodb://localhost/wallaclone";

export class MongooseConnection {
  constructor() {
    this.listenToEvents();
  }

  listenToEvents() {
    mongoose.connection.on("error", function (err) {
      console.error("mongodb connection error:", err);
      process.exit(1);
    });

    mongoose.connection.once("open", function () {
      console.info("Connected to mongodb.");
    });
  }

  async connect(): Promise<void> {
    await mongoose.connect(URL_DATABASE);
  }

  async close(): Promise<void> {
    mongoose.connection.close();
  }
}

// export const connect = async (): Promise<void> => {
//   await mongoose.connect(URL_DATABASE)
// };
// export const close = (): Promise<void> => mongoose.connection.close();
