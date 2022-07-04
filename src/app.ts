import createError from "http-errors";
import cors from "cors";

import express, { RequestHandler, ErrorRequestHandler } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import ControllerI from "./routes//controllers/models/controller.model";
import { Advertisements } from "./routes/controllers/advertisements.controller";
import { MongooseConnection } from "./connectMongoose";
import { User } from "./routes/controllers/user.controller";


// Login Marce

import LoginController from './routes/controllers/loginController';
import jwtAuth from "./lib/jwtAuth";
// import {jwtAuth} from './lib/jwtAuth';
const loginController = new LoginController();



//Meter todos los controllers en este array
const appControllers: Array<ControllerI> = [new Advertisements(), new User()];

class App {
  public app: express.Application;
  public mongooseConnection = new MongooseConnection();
  constructor() {
    this.app = express();
    this.mongooseConnection.connect();
    this.config();
    this.routerSetup();
    this.initializeControllers(appControllers);
    this.errorHandler();
  }

  private config() {
    // view engine setup
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "jade");

    this.app.use(logger("dev"));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true, limit:"30" }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  private routerSetup() {
    this.app.use("/", indexRouter);
    this.app.use("/users", usersRouter);

    // Login Marce 

    this.app.post('/api/login', loginController.postJWT)
  }

  private initializeControllers(controllers: ControllerI[]) {
    controllers.forEach((controller) => {
      this.app.use(``, jwtAuth, controller.router);
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
