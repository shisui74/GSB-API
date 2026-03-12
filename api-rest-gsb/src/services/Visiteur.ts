import { VisiteurModel, IVisiteurDocument } from '../models/Visiteur';
import { ICreateVisiteur, IVisiteur } from '../models/interfaces/IVisiteur';

/**
 * Service pour gérer la logique métier des visiteurs
 */
export class VisiteurService {

  /**
   * Détermine si un visiteur est junior.
   */
  public isJunior(visiteur: Pick<IVisiteur, 'dateEmbauche'>): boolean {
    if (!visiteur.dateEmbauche) {
      return true;
    }

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return visiteur.dateEmbauche > oneYearAgo;
  }
  
  /**
   * Créer un nouvel visiteur
   */
  public async createVisiteur(visiteurData: ICreateVisiteur): Promise<IVisiteurDocument> {
    try {
      const existingVisiteur = await VisiteurModel.findOne({ email: visiteurData.email });
      if (existingVisiteur) {
        throw new Error(`Un visiteur avec l'email ${visiteurData.email} existe déjà`);
      }
      const visiteur = new VisiteurModel(visiteurData);
      await visiteur.save();
      return visiteur;
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new Error(`Validation échouée: ${messages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Récupérer tous les visiteurs (Version allégée)
   */
  public async getAllVisiteurs(): Promise<IVisiteurDocument[]> {
    try {
      const visiteurs = await VisiteurModel.find()
        .select('nom prenom email telephone -_id')
        .sort({ dateCreation: -1 })
        .exec();
      return visiteurs;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des visiteurs');
    }
  }

  /**
   * Récupérer un visiteur par son ID (Version allégée aussi !)
   */
  public async getVisiteurById(id: string): Promise<IVisiteurDocument | null> {
    try {
      const visiteur = await VisiteurModel.findById(id)
        // 👇 MODIFICATION ICI : On applique le même filtre que pour la liste
        .select('nom prenom email telephone -_id')
        
        // On ne met PAS de .populate('portefeuille'), donc il ne s'affichera pas.
        .exec();

      if (!visiteur) {
        throw new Error(`Visiteur avec l'ID ${id} introuvable`);
      }
      return visiteur;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new Error(`ID invalide: ${id}`);
      }
      throw error;
    }
  }
}