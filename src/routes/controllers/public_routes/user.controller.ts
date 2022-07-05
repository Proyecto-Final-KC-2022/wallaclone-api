import Controller from "../models/controller.model";
import * as express from "express";
import ResponseI from "../models/response.model";
import * as userService from '../../services/user.service';
import { IUser } from '../../../models/User';

export class User implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/user/", this.getUsers);
    this.router.get("/user/:id", this.getUserById);
    this.router.post('/user/signup', this.registerUser);

  }

  private getUsers = async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let controllerResponse: ResponseI<Array<IUser & { _id: any }>>;

      controllerResponse = await userService.getUsers();

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };

  private getUserById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let controllerResponse: ResponseI<IUser & { _id: any }>;

      controllerResponse = await userService.getUserById(
        req.params["id"]?.toString()
      );

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };
  
  private registerUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const user = {
      body: req.body as { name: string; email: string; password: string }
    }

    try {
      let controllerResponse: ResponseI<IUser & { name: any, email: any; password: any }>;

      // Create user
      controllerResponse = await userService.registerUser(
        user["body"].name,
        user["body"].email,
        user["body"].password
      );

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  }

}


