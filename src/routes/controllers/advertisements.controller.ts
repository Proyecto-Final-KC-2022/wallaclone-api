import Controller from "./models/controller.model";
import * as express from "express";
import ResponseI from "./models/response.model";
import * as advertisementsService from '../services/advertisements.service';
import { IAdvertisement } from "../../models/Advertisement";

export class Advertisements implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/advertisements/", this.getAdvertisements);
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
      name: req.query["name"]?.toString()
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
}
