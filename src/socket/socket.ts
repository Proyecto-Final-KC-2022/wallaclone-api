import { Server, Socket } from "socket.io";
import { Chat } from "../models/Chat";
import { Message, IMessage } from "../models/Message";

class SocketService {
  private io: Server;
  constructor() {}

  startServerListener(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.SOCKET_CLIENT,
      },
    });
    this.io.on("connection", (socket: Socket) => {
      console.log("Socket connected and listening on server...");
      console.log(
        `Numero de clientes conectados ==>>`,
        this.io.engine.clientsCount
      );
      /* Recepcion del evento login para añadir el usuario a la */
      socket.on("login", async (data: { userId: string }) => {
        socket.broadcast.emit("userLogin", { userId: data.userId });
        console.log(
          `Numero de clientes conectados tras login de ==>> ${data.userId}`,
          this.io.engine.clientsCount
        );
      });

      socket.on("joinChatRoom", async (data: { userId: string }) => {
        socket.join(data.userId);
      });

      socket.on(
        "sendMessage",
        async (data: {
          chatId: string;
          advertId: string;
          message: { content: string; sender: string; receiver: string };
        }) => {
          //1-  Crear el mensaje
          const { content, sender, receiver } = data.message;
          const message = await Message.create({
            content,
            sender,
            receiver,
            creationDate: new Date().toISOString(),
            read: false,
          });
          //2-  comprobar si existe chat, si me pasan el id existe, si no, no
          //si existe añado el mensaje, si no existe, creo el chat y añado el primer mensaje
          if (data.chatId) {
            await Chat.findByIdAndUpdate(data.chatId, {
              $addToSet: { messages: [message._id] },
            });
          } else {
            await Chat.create({
              advertId: data.advertId,
              members: [data.message.sender, data.message.receiver],
              messages: [message._id],
            });
          }
          //3- Emito el contenido del mensaje para que el front actualice aitomaticamente el mensaje en directo
          // socket.to(sender).emit("getPrivateMessage", data.message);
          socket.to(receiver).emit("getPrivateMessage", {
            chatId: data.chatId,
            message: message["_doc"],
          });
        }
      );

      socket.on(
        "clearPrivateUnreadMessages",
        async (data: {
          chatId: string;
          receiverId: string; //se pasará el id del usuario que está abriendo el chat
          // message: { content: string; sender: string; receiver: string };
        }) => {
          const chat = await Chat.findById(data.chatId)
            .populate<{ messages: Array<IMessage> }>("messages")
            .orFail()
            .lean();
          const unreadMessagesIds = chat?.messages
            ?.filter(
              (c) => c.receiver?.toString() === data?.receiverId && !c.read
            )
            ?.map((x) => x._id.toString());
          await Message.updateMany(
            { _id: { $in: unreadMessagesIds } },
            { $set: { read: true } },
            { multi: true }
          );
        }
      );

      socket.on(
        "allMessagesAreRead",
        (data: { read: boolean; currentUserId: string }) => {
          socket.emit("setMessagesAsRead", data.read);
        }
      );

      socket.on("setUnreadChatMessage", (currentUserId: string) => {
        socket.emit("messageUnread", true);
      });

      socket.on("userLogout", (data: { userId: string }) => {
        socket.leave(data.userId);
        socket.broadcast.emit("userLogout", { userId: data.userId });
        console.log(
          `Numero de clientes conectados tras logout de ==>> ${data.userId}`,
          this.io.engine.clientsCount
        );
      });
    });
  }
}

export default new SocketService();
