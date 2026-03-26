import { Request, Response } from 'express';
import { VisiteurService } from '../services/Visiteur';
import { PortefeuilleService } from '../services/Portefeuille';

export class VisiteurController {
  private visiteurService: VisiteurService;
  private portefeuilleService: PortefeuilleService;

  constructor() {
    this.visiteurService = new VisiteurService();
    this.portefeuilleService = new PortefeuilleService();
  }

  /**
   * POST /api/visiteurs - Créer un visiteur
   */
  public createVisiteur = async (req: Request, res: Response): Promise<void> => {
    try {
      const visiteur = await this.visiteurService.createVisiteur(req.body);
      res.status(201).json({
        success: true,
        message: 'Visiteur créé avec succès',
        data: visiteur
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création'
      });
    }
  };

  /**
   * GET /api/visiteurs - Récupérer tous les visiteurs
   */
  public getAllVisiteurs = async (_req: Request, res: Response): Promise<void> => {
    try {
      const visiteurs = await this.visiteurService.getAllVisiteurs();
      res.status(200).json({
        success: true,
        count: visiteurs.length,
        data: visiteurs
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération'
      });
    }
  };

  /**
   * GET /api/visiteurs/:id - Récupérer un visiteur par ID
   */
  public getVisiteurById = async (req: Request, res: Response): Promise<void> => {
    try {
      const visiteur = await this.visiteurService.getVisiteurById(req.params.id);
      res.status(200).json({
        success: true,
        data: visiteur
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Visiteur introuvable'
      });
    }
  };

  /**
   * --- AJOUT USER STORY 1 : Gestion du Portefeuille ---
   * POST /api/visiteurs/:id/portefeuille
   */
  public ajouterPraticienAuPortefeuille = async (req: Request, res: Response): Promise<void> => {
    try {
      const visiteurId = req.params.id;
      const praticienId = req.body.praticien;

      if (!praticienId) {
        res.status(400).json({ success: false, message: "L'ID du praticien est requis dans le champ 'praticien'" });
        return;
      }

      // CORRECTION ICI : On passe 2 arguments séparés pour correspondre à la signature du Service
      const resultat = await this.portefeuilleService.ajouter(visiteurId, praticienId);

      res.status(201).json({
        success: true,
        message: 'Praticien ajouté au portefeuille avec succès',
        data: resultat
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de l'ajout au portefeuille"
      });
    }
  };

  /**
   * --- AJOUT USER STORY 2 : Consultation ---
   * GET /api/visiteurs/:id/portefeuille
   */
  public getPortefeuilleVisiteur = async (req: Request, res: Response): Promise<void> => {
    try {
      const visiteurId = req.params.id;
      
      // CORRECTION ICI : Le nom de la méthode est getByVisiteur dans ton Service
      const portefeuille = await this.portefeuilleService.getByVisiteur(visiteurId);

      res.status(200).json({
        success: true,
        count: portefeuille.length,
        data: portefeuille
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de la récupération du portefeuille"
      });
    }
  };

  /**
   * --- AJOUT SUPPLEMENTAIRE ---
   * DELETE /api/visiteurs/:id/portefeuille/:lienId
   */
  public retirerPraticienDuPortefeuille = async (req: Request, res: Response): Promise<void> => {
  try {
    // Attention : on récupère maintenant l'ID du praticien dans l'URL
    const visiteurId = req.params.id;
    const praticienId = req.params.praticienId; 

    await this.portefeuilleService.retirer(visiteurId, praticienId);
    
    res.status(200).json({ success: true, message: "Praticien retiré du portefeuille" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

/**
   * --- USER STORY 4 : Ne plus suivre un praticien (Archivage) ---
   * PATCH /api/visiteurs/:id/portefeuille/:praticienId
   */
  public cloturerSuiviPraticien = async (req: Request, res: Response): Promise<void> => {
    try {
      const visiteurId = req.params.id;
      const praticienId = req.params.praticienId;

      const resultat = await this.portefeuilleService.terminerSuivi(visiteurId, praticienId);

      res.status(200).json({
        success: true,
        message: 'Suivi du praticien terminé avec succès',
        data: resultat
      });
    } catch (error: any) {
      res.status(404).json({ // 404 car on n'a pas trouvé le lien actif
        success: false,
        message: error.message || "Erreur lors de la clôture du suivi"
      });
    }
  };

  public creerUnCompte = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Données reçues pour la création du visiteur:', req.body);
    const { nom, prenom, email, password, tel, telephone, dateEmbauche } = req.body;
   
    const visiteurData = {
      nom,
      prenom,
      email,
      password,
      telephone: telephone ?? tel,
      dateEmbauche
    };


    console.log('Données du visiteur à créer:', visiteurData);


      const visiteur = await this.visiteurService.creerUnCompte(visiteurData);
     
      res.status(201).json({
        success: true,
        message: 'Visiteur créé avec succès',
        data: visiteur
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création'
      });
    }
  };


 public seConnecter = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Données reçues pour la connexion du visiteur:', req.body);
    const { email, password } = req.body;


      const { token, visiteur } = await this.visiteurService.seConnecter(email, password);


      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        token,
        data: visiteur
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      });
    }
  };


}