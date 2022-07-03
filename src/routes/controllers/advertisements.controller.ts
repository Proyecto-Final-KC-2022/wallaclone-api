import Controller from './models/controller.model';
import * as express from 'express';
import ResponseI from './models/response.model';
import * as advertisementsService from '../services/advertisements.service';
import { IAdvertisement } from '../../models/Advertisement';

export class Advertisements implements Controller {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get('/advertisements/', this.getAdvertisements);
    this.router.post('/advert', this.createAdvertisement);
  }

  private getAdvertisements = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {    
    const options = {
      start: req.query['start']?.toString(),
      limit: req.query['limit']?.toString(),
      sort: req.query['sort']?.toString(),
      tags: req.query['tags']?.toString(),
      forSale: req.query['forSale']?.toString(),
      price: req.query['price']?.toString(),
      name: req.query['name']?.toString(),
    };

    try {
      let controllerResponse: ResponseI<Array<IAdvertisement & { _id: any }>>;

      controllerResponse = await advertisementsService.getAdvertisements(
        options,
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
    next: express.NextFunction,
  ) => {
    try {
      console.log('*********** req.body ***********');
      console.log(req.body);

      const anuncio = {
        body: req.body as { 
          name: string, 
          image: string, 
          description: string,
          forSale: boolean,
          price: number,
          tags: any,
          creationDate: string,
          owner: any,
          preOrdered: boolean,
          sold: boolean
        }
      }
      console.log('*********** anuncio ***********');
      console.log(anuncio);

      //console.log('*********** req.body ***********');
      //console.log(req.body);

      let controllerResponse: any;
      controllerResponse = await advertisementsService.createAdvertisement(
        anuncio["body"].name,
        anuncio["body"].image,
        anuncio["body"].description,
        anuncio["body"].forSale,
        anuncio["body"].price,
        anuncio["body"].tags,
        anuncio["body"].creationDate,
        anuncio["body"].owner,
        anuncio["body"].preOrdered,
        anuncio["body"].sold
      );

      console.log('*********** controllerResponse ***********');
      console.log(controllerResponse);

      res
        .status(controllerResponse.status || 201)
        .json(controllerResponse.data);
    } catch (err) {
      next(err);
    }
  };
}
