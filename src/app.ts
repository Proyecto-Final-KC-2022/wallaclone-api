import createError from "http-errors";
import cors from "cors";

import express, { RequestHandler, ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { MongooseConnection } from "./connectMongoose";
import ControllerI from "./routes//controllers/models/controller.model";
//Rutas privadas
import { Advertisements as AdvertisementsPrivate } from "./routes/controllers/private_routes/advertisements.controller";
import { User as UsersPrivate} from "./routes/controllers/private_routes/user.controller";
//Rutas publicas
import LoginController from './routes/controllers/public_routes/loginController';
import { Advertisements as AdvertisementsPublic } from "./routes/controllers/public_routes/advertisements.controller";
import { User as UsersPublic} from "./routes/controllers/public_routes/user.controller";
import jwtAuth from "./lib/jwtAuth";
// import {jwtAuth} from './lib/jwtAuth';
const loginController = new LoginController();

//Controllers con endpoints de acceso private
const appPrivateControllers: Array<ControllerI> = [new AdvertisementsPrivate(), new UsersPrivate()];
//Controllers con endpoints de acceso publico
const appPublicControllers: Array<ControllerI> = [new AdvertisementsPublic(), new UsersPublic()];


class App {
  public app: express.Application;
  public mongooseConnection = new MongooseConnection();
  constructor() {
    this.app = express();
    this.mongooseConnection.connect();
    this.config();
    this.routerSetup();
    this.initializePublicControllers(appPublicControllers);
    this.initializePrivateControllers(appPrivateControllers);
    this.errorHandler();
  }

  private config() {
    // view engine setup
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "jade");

    this.app.use(logger("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true}));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  private routerSetup() {
    // Login Marce 
    this.app.post('/api/login', loginController.postJWT)
  }

  private initializePrivateControllers(controllers: ControllerI[]) {
    controllers.forEach((controller) => {
      this.app.use(``, jwtAuth, controller.router);
    });
  }

  private initializePublicControllers(controllers: ControllerI[]) {
    controllers.forEach((controller) => {
      this.app.use(``, controller.router);
    });
  }

  private errorHandler() {
    // catch 404 and forward to error handler
    const requestHandler: RequestHandler = function (_req, _res, next) {
      next(createError(404));
    };
    this.app.use(requestHandler);

    // error handler
    const errorRequestHandler: ErrorRequestHandler = function (
      err,
      req,
      res,
      _next
    ) {
      // set locals, only providing error in development
      //res.locals.message = err.message;
      //res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.json(err);
    };
    this.app.use(errorRequestHandler);
  }
}

export default new App().app;
