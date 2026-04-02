import { Request, Response } from 'express';
import { VisiteService } from '../services/Visite';


export class VisiteController {
  private visiteService: VisiteService;

  constructor() {
    this.visiteService = new VisiteService();
  }


  /**
   * POST /api/visites - Créer une visite
   */
  public createVisite = async (req: Request, res: Response): Promise<void> => {
    try {
      const visite = await this.visiteService.createVisite(req.body);
      console.log(req.body);
      res.status(201).json({
        success: true,
        message: 'Visite créée avec succès',
        data: visite
      });
    } catch (error: any) {
         console.log(req.body);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création'
      });
    }
  };
  /**
   * GET /api/visites - Récupérer toutes les visites
   */
  public getAllVisites = async (_req: Request, res: Response): Promise<void> => {
    try {
      const visites = await this.visiteService.getAllVisites();
      res.status(200).json({
        success: true,
        count: visites.length,
        data: visites
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération'
      });
    }
  };
  /**
   * GET /api/visites/:id - Récupérer une visite par ID
   */
  public getVisiteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const visite = await this.visiteService.getVisiteById(req.params.id);
     
      res.status(200).json({
        success: true,
        data: visite
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Praticien introuvable'
      });
    }
  };
}
