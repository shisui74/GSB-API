import { Request, Response } from 'express';
import { PraticienService } from '../services/Praticien';


export class PraticienController {
  private praticienService: PraticienService;

  constructor() {
    this.praticienService = new PraticienService();
  }


  /**
   * POST /api/praticiens - Créer un praticien
   */
  public createPraticien = async (req: Request, res: Response): Promise<void> => {
    try {
      const praticien = await this.praticienService.createPraticien(req.body);
      console.log(req.body);
      res.status(201).json({
        success: true,
        message: 'Praticien créé avec succès',
        data: praticien
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
   * GET /api/praticiens - Récupérer tous les praticiens
   */
  public getAllPraticiens = async (_req: Request, res: Response): Promise<void> => {
    try {
      const praticiens = await this.praticienService.getAllPraticiens();
      res.status(200).json({
        success: true,
        count: praticiens.length,
        data: praticiens
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération'
      });
    }
  };
  /**
   * GET /api/praticiens/:id - Récupérer un praticien par ID
   */
  public getPraticienById = async (req: Request, res: Response): Promise<void> => {
    try {
      const praticien = await this.praticienService.getPraticienById(req.params.id);
     
      res.status(200).json({
        success: true,
        data: praticien
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Praticien introuvable'
      });
    }
  };
}
