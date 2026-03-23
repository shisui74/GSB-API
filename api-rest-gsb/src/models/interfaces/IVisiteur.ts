import { Types } from "mongoose";

/**
 * Interface représentant un utilisateur
 */
export interface IVisiteur {
  _id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  password?: string;
  email: string;
  dateCreation?: Date;
  dateEmbauche?: Date;
  visites?: Types.ObjectId[];
  portefeuille?: Types.ObjectId[];
}


/**
 * Interface pour la création d'un utilisateur
 */
export interface ICreateVisiteur {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

/**
 * Interface pour la création d'un compte visiteur
 */
export interface ICreateCompteVisiteur extends ICreateVisiteur {
  password: string;
  dateEmbauche?: Date;
}
