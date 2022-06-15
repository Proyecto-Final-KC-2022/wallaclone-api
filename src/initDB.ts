import { MongooseConnection } from "./connectMongoose";
import { Advertisement } from "./models/Advertisement";
import * as readLine from "readline";
import { ANUNCIOS } from "./anuncios";


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

  // Inicializar nuestros modelos
  const { deletedCount, loadedCount } = await initAnuncios(ANUNCIOS);
  console.log(
    `\nAnuncios: Deleted ${deletedCount}, loaded ${loadedCount}`
  );

  // Cuando termino, cierro la conexión a la BD
  await mongooseConnection.close();
  console.log("\nDone.");
  return process.exit(0);
}

async function initAnuncios(data: any) {
  const { deletedCount } = await Advertisement.deleteMany();
  const loadedCount = await Advertisement.loadMockedData(data);
  return { deletedCount, loadedCount };
}

// async function initUsuarios() {
//   const { deletedCount } = await Usuario.deleteMany();
//   const loadedCount = await Usuario.insertMany([
//     {
//       name: "user",
//       email: "user@example.com",
//       password: Usuario.hashPassword("1234"),
//     },
//     {
//       name: "user2",
//       email: "user2@example.com",
//       password: Usuario.hashPassword("1234"),
//     },
//   ]);
//   return { deletedCount, loadedCount };
// }

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
