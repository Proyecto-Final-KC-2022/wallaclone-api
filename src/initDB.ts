import * as dotenv from "dotenv";
dotenv.config();
import { MongooseConnection } from "./connectMongoose";
import { Advertisement } from "./models/Advertisement";
import * as readLine from "readline";
import { ANUNCIOS } from "./anuncios";
import { User } from "./models/User";

main().catch((err) => console.error("Error!", err));

async function main() {
  // Si buscáis en la doc de mongoose (https://mongoosejs.com/docs/connections.html),
  // veréis que mongoose.connect devuelve una promesa que podemos exportar en connectMongoose
  // Espero a que se conecte la BD (para que los mensajes salgan en orden)
  const mongooseConnection = new MongooseConnection();
  await mongooseConnection.connect();

  const answer = await askUser(
    "Are you sure you want to empty DB and load initial data? Y/N "
  );
  if (answer.toLowerCase() !== "y") {
    console.log("DB init aborted! nothing has been done");
    return process.exit(0);
  }
  const { deletedUserCount, loadedUserCount } = await initUsers();
  console.log(
    `\nUsuarios: Deleted ${deletedUserCount}, loaded ${loadedUserCount}`
  );
    await Advertisement.deleteMany();

  for await (const [index, user] of (await User.find({})).entries()) {
    console.log(user);
    if (index === 0) {
      const advert = await Advertisement.create({
        ...ANUNCIOS[index],
        owner: user.id,
      });
      console.log(`Anuncio insertado: ${advert}`); 
    } else {
      const nextAdverts = ANUNCIOS.splice(index, index + 1);
      nextAdverts.forEach(async (nxtAd) => {
        const advert = await Advertisement.create({
          ...nxtAd,
          owner: user.id,
        }); 
        console.log(`Anuncio insertado: ${advert}`);
      });
    }
  }
  // Comprobar que funciona al buscar anuncios por id de usuario
  for await (const user of await User.find({})) {
    const adverts = await Advertisement.listAdvertsByUser(user.id); 
    console.log(`Anuncios: ${adverts} creados por usuario ${user.name}`);
  }

  // Cuando termino, cierro la conexión a la BD
  await mongooseConnection.close();
  console.log("\nDone.");
  return process.exit(0);
}

// async function initAnuncios(data: any) {
//   const { deletedCount } = await Advertisement.deleteMany();
//   const loadedCount = await Advertisement.loadMockedData(data);
//   return { deletedCount, loadedCount };
// }

async function initUsers() {
  const { deletedCount: deletedUserCount } = await User.deleteMany();
  const loadedUserCount = await User.insertMany([
    {
      name: "user1",
      email: "user1@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user2",
      email: "user2@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user3",
      email: "user3@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user4",
      email: "user4@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user5",
      email: "user5@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user6",
      email: "user6@example.com",
      password: await User.encryptPassword("1234"),
    },
    {
      name: "user7",
      email: "user7@example.com",
      password: await User.encryptPassword("1234"),
    },{
      name: "user8",
      email: "user8@example.com",
      password: await User.encryptPassword("1234"),
    },{
      name: "user9",
      email: "user9@example.com",
      password: await User.encryptPassword("1234"),
    },{
      name: "user10",
      email: "user10@example.com",
      password: await User.encryptPassword("1234"),
    },{
      name: "user11",
      email: "user11@example.com",
      password: await User.encryptPassword("1234"),
    },
  ]);
  return { deletedUserCount, loadedUserCount };
}

async function askUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
