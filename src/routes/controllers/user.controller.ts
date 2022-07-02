import Controller from "./models/controller.model";
import * as express from "express";
import ResponseI from "./models/response.model";
import * as userService from '../services/user.service';
import { IUser } from '../../models/User';
import { IAdvertisement } from '../../models/Advertisement';
import { CustomError } from '../../utils/error.utils';

export class User implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/user/", this.getUsers);
    this.router.get("/user/:id", this.getUserById);
    this.router.put("/user/addFavorite", this.addFavorite);
    this.router.put("/user/removeFavorite", this.removeFavorite);
    this.router.get("/user/favorites/:id", this.getFavorites);
    this.router.delete("/user/:id", this.deleteUser);
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

      controllerResponse = await userService.getUserById(req.params['id']?.toString());

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };


  private addFavorite = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = {
      body: req.body as { userId: string; advertId: string;}
    };
    

    try {
      let controllerResponse: ResponseI<IUser & { _id: any }>;

      controllerResponse = await userService.addFavorite(options['body'].userId, options['body']?.advertId);

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };


  private removeFavorite = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = {
        body: req.body as { userId: string; advertId: string;}
      };
      
  
      try {
        let controllerResponse: ResponseI<IUser & { _id: any }>;
  
        controllerResponse = await userService.removeFavorite(options['body'].userId, options['body']?.advertId);
  
        res
          .status(controllerResponse.status || 200)
          .json(controllerResponse.data);
      } catch (err) {
        next(err);
      }
  };

  private getFavorites = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {

    try {
      let controllerResponse: ResponseI<Array<IAdvertisement> |  CustomError>;

      controllerResponse = await userService.getFavorites(req.params['id']?.toString());

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };


  private deleteUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
  
      try {
        let controllerResponse: ResponseI<any>;
        controllerResponse = await userService.deleteUser(req?.params?.id);
        res
          .status(controllerResponse.status || 200)
          .json(controllerResponse.data);
      } catch (err) {
        next(err);
      }
  };
}
