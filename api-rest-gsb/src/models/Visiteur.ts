import mongoose, { Schema, Model, Document } from 'mongoose';
import { IVisiteur } from './interfaces/IVisiteur';

export type IVisiteurDocument = IVisiteur & Document & {
  isJunior(): boolean;
};

/**
 * Schéma Mongoose pour Visiteur
 */
const visiteurSchema = new Schema<IVisiteurDocument>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
      type: String,
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est obligatoire'],
    },
    dateCreation: {
      type: Date,
      default: Date.now
    },
    dateEmbauche: {
      type: Date
    },
    visites: [{
      type: Schema.Types.ObjectId,
      ref: 'Visite'
    }]
  },
  {
    versionKey: false,
    // 👇 INDISPENSABLE : Active l'affichage des champs virtuels (comme portefeuille)
    toJSON: { virtuals: true,  },
    toObject: { virtuals: true }
  }
);

// 👇 DÉFINITION DU VIRTUAL : Fait le lien avec la collection 'Portefeuille'
visiteurSchema.virtual('portefeuille', {
  ref: 'Portefeuille',      // Nom du modèle à aller chercher
  localField: '_id',        // ID du visiteur (ici)
  foreignField: 'visiteur'  // Champ 'visiteur' dans l'autre collection
});

visiteurSchema.methods.isJunior = function (): boolean {
  if (!this.dateEmbauche) {
    return true;
  }

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  return this.dateEmbauche > oneYearAgo;
};

export const VisiteurModel: Model<IVisiteurDocument> = mongoose.model<IVisiteurDocument>('Visiteur', visiteurSchema);