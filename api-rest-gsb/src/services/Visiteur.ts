import { VisiteurModel, IVisiteurDocument } from '../models/Visiteur';
import { ICreateCompteVisiteur, ICreateVisiteur } from '../models/interfaces/IVisiteur';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Service pour gérer la logique métier des visiteurs
 */
export class VisiteurService {

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

  public async creerUnCompte(visiteurData: ICreateCompteVisiteur): Promise<IVisiteurDocument> {


    try {
      // Vérifier si l'email existe déjà
      const existingVisiteur = await VisiteurModel.findOne({ email: visiteurData.email });


      if (existingVisiteur) {
        throw new Error(`Un visiteur avec l'email ${visiteurData.email} existe déjà`);
      }
      // Créer et sauvegarder le visiteur
      const hashedPassword = await bcrypt.hash(visiteurData.password, 10);
      const visiteur = new VisiteurModel({
        email: visiteurData.email,
        password: hashedPassword,
        nom: visiteurData.nom,
        prenom: visiteurData.prenom,
        telephone: visiteurData.telephone,
        dateEmbauche: visiteurData.dateEmbauche
      });
      await visiteur.save();
      return visiteur
    } catch (error: any) {
      // Gestion des erreurs de validation Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        const errorMessage = `Validation échouée: ${messages.join(', ')}`;
        console.error('[ValidationError]', errorMessage);
        throw new Error(errorMessage);
      }
      console.error('[Error]', error);
      throw error;
    }
  }


  public async seConnecter(email: string, password: string): Promise<{ token: string; visiteur: IVisiteurDocument }> {
    try {
      const visiteur = await VisiteurModel.findOne({ email });


      if (!visiteur) {
        throw new Error('Email ou mot de passe incorrect');
      }
      if (!visiteur.password) {
        throw new Error('Compte invalide: mot de passe absent');
      }
      const isPasswordValid = await bcrypt.compare(password, visiteur.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }
      const token = jwt.sign(
        { userId: visiteur._id, role: 'visiteur' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h', algorithm: 'HS256' }
      );
      return { token, visiteur };




    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new Error(`Error lors de la connexion: ${error.message}`);
      }
      throw error;
    }
  }

}

