import Controller from ".././models/controller.model";
import * as express from "express";
import ResponseI from ".././models/response.model";
import * as advertisementsService from "../../services/advertisements.service";
import { IAdvertisement } from "../../../models/Advertisement";

export class Advertisements implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.post("/advertisements", this.createAdvertisement);
    // this.router.put("/advertisements", this.modifyAdvertisement);
    this.router.delete("/advertisements", this.deleteAdvertisements);
  }



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
