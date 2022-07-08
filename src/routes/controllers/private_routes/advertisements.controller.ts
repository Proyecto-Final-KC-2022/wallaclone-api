import Controller from ".././models/controller.model";
import * as express from "express";
import ResponseI from ".././models/response.model";
import * as advertisementsService from "../../services/advertisements.service";
import { IAdvertisement } from "../../../models/Advertisement";
import { upload } from "../../services/imageUploadS3";

export class Advertisements implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.post("/advertisements", this.createAdvertisement);
    // this.router.put("/advertisements", this.modifyAdvertisement);
    this.router.post(
      "/advert",
      upload.single("image"),
      this.createAdvertisement
    );
    this.router.delete("/advertisements", this.deleteAdvertisements);
  }

  private deleteAdvertisements = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = {
      body: req.body as { advertisementsIds: Array<string> },
    };
    try {
      let controllerResponse: ResponseI<IAdvertisement & { _id: any }>;

      controllerResponse = await advertisementsService.deleteAdvertisements(
        options?.body?.advertisementsIds
      );
      res
        .status(controllerResponse.status || 200)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };

  private createAdvertisement = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      console.log("*********** req.body ***********");
      console.log(req.body);
      console.log(req.file);

      const anuncio = {
        body: req.body as {
          name: string;
          image: string;
          description: string;
          forSale: boolean;
          price: number;
          tags: any;
          creationDate: string;
          owner: any;
          preOrdered: boolean;
          sold: boolean;
        },
      };

      let controllerResponse: any;
      controllerResponse = await advertisementsService.createAdvertisement(
        anuncio["body"].name,
        req.file["location"],
        anuncio["body"].description,
        anuncio["body"].forSale,
        anuncio["body"].price,
        anuncio["body"].tags,
        anuncio["body"].creationDate,
        anuncio["body"].owner,
        anuncio["body"].preOrdered,
        anuncio["body"].sold
      );

      console.log("*********** controllerResponse ***********");
      console.log(controllerResponse);

      res
        .status(controllerResponse.status || 201)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };
}
