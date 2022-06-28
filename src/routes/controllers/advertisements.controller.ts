import Controller from "./models/controller.model";
import * as express from "express";
import ResponseI from "./models/response.model";
import * as advertisementsService from "../services/advertisements.service";
import { IAdvertisement } from "../../models/Advertisement";

export class Advertisements implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/advertisements/", this.getAdvertisements);
    this.router.get("/advertisements/:id", this.getAdvertisementById);
    // this.router.post("/advertisements", this.createAdvertisement);
    // this.router.put("/advertisements", this.modifyAdvertisement);
    this.router.delete("/advertisements", this.deleteAdvertisements);
  }

  private getAdvertisements = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = {
      start: req.query["start"]?.toString(),
      limit: req.query["limit"]?.toString(),
      sort: req.query["sort"]?.toString(),
      tags: req.query["tags"]?.toString(),
      forSale: req.query["forSale"]?.toString(),
      price: req.query["price"]?.toString(),
      name: req.query["name"]?.toString(),
    };
    // const foo= {
    //     bar: 'bar'
    // }

    try {
      let controllerResponse: ResponseI<Array<IAdvertisement & { _id: any }>>;

      controllerResponse = await advertisementsService.getAdvertisements(
        options
      );

      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };

  private getAdvertisementById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    
    try {
      let controllerResponse: ResponseI<IAdvertisement & { _id: any }>;

      controllerResponse = await advertisementsService.geAdvertisementById(req?.params?.['id']?.toString());
      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };

  private deleteAdvertisements = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = {
      body: req.body as { advertisementsIds: Array<string>;}
    };
    try {
      let controllerResponse: ResponseI<IAdvertisement & { _id: any }>;

      controllerResponse = await advertisementsService.deleteAdvertisements(options?.body?.advertisementsIds);
      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };
}
