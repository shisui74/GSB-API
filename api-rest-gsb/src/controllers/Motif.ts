import { Request, Response } from 'express';
import { MotifService } from '../services/Motif';


export class MotifController {
  private motifService: MotifService;


  constructor() {
    this.motifService = new MotifService();
  }


  /**
   * POST /api/motifs - Créer un motif
   */
  public createMotif = async (req: Request, res: Response): Promise<void> => {
    try {
      const motif = await this.motifService.createMotif(req.body);

      console.log(req.body);
      res.status(201).json({
        success: true,
        message: 'Motif créé avec succès',
        data: motif
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
   * GET /api/motifs - Récupérer tous les motifs
   */
  public getAllMotifs = async (_req: Request, res: Response): Promise<void> => {
    try {
      const motifs = await this.motifService.getAllMotifs();

      res.status(200).json({
        success: true,
        count: motifs.length,
        data: motifs
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération'
      });
    }
  };
  /**
   * GET /api/motifs/:id - Récupérer un motif par ID
   */
  public getMotifById = async (req: Request, res: Response): Promise<void> => {
    try {
      const motif = await this.motifService.getMotifById(req.params.id);
     
      res.status(200).json({
        success: true,
        data: motif
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Motif introuvable'
      });
    }
  };
}