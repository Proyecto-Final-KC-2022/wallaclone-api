import Controller from ".././models/controller.model";
import * as express from "express";
import ResponseI from ".././models/response.model";
import * as advertisementsService from "../../services/advertisements.service";
import { IAdvertisement } from "../../../models/Advertisement";

export class Advertisements implements Controller {
  private readonly POSSIBLE_TAGS = [
    "Trabajo",
    "Estilo de vida",
    "Motor",
    "Telefonía móvil",
    "Ocio",
    "Informática",
  ];
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/advertisements/", this.getAdvertisements);
    this.router.get("/advertisements/:id", this.getAdvertisementById);
    this.router.get("/availableTags", this.getAvailableTags);
  }

  private getAdvertisements = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const tags = req?.query["tags"]?.toString();
    const options = {
      start: req.query["start"]?.toString(),
      limit: req.query["limit"]?.toString(),
      sort: req.query["sort"]?.toString(),
      tags: tags ? (JSON.parse(tags) as Array<string>) : [],
      forSale: req.query["forSale"]?.toString(),
      price: req.query["price"]?.toString(),
      name: req.query["name"]?.toString(),
    };

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

      controllerResponse = await advertisementsService.geAdvertisementById(
        req?.params?.["id"]?.toString()
      );
      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };

  private getAvailableTags = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      console.log("asdasd");
      res.status(200).json(this.POSSIBLE_TAGS);
    } catch (err) {
      next(err);
    }
  };
}
