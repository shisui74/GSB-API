import { PortefeuilleModel, IPortefeuille } from '../models/Portefeuille';

export class PortefeuilleService {

  /**
   * Retourne le nombre total de praticiens dans le portefeuille du visiteur
   */
  public async getNombrePortefeuille(visiteurId: string): Promise<number> {
    try {
      const count = await PortefeuilleModel.countDocuments({ 
        visiteur: visiteurId 
      });
      return count;
    } catch (error) {
      throw new Error('Erreur lors du comptage du portefeuille');
    }
  }

  /**
   * Retourne le nombre de praticiens dans le portefeuille actif du visiteur
   */
  public async getNombrePortefeuilleActif(visiteurId: string): Promise<number> {
    try {
      const count = await PortefeuilleModel.countDocuments({ 
        visiteur: visiteurId,
        dateFinSuivi: null
      });
      return count;
    } catch (error) {
      throw new Error('Erreur lors du comptage du portefeuille actif');
    }
  }
  
  // Ajouter
  public async ajouter(visiteurId: string, praticienId: string): Promise<IPortefeuille> {
    try {
      const lien = new PortefeuilleModel({ 
        visiteur: visiteurId, 
        praticien: praticienId 
      });
      
      await lien.save();

      // AJOUT : On charge les infos du praticien (et du visiteur si besoin)
      await lien.populate('praticien');
      // await lien.populate('visiteur'); // Décommentez si vous voulez aussi les infos du visiteur
      
      return lien;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Ce praticien est déjà dans le portefeuille de ce visiteur");
      }
      throw error;
    }
  }

  // MODIFICATION ICI : On ajoute le filtre { dateFinSuivi: null }
  public async getByVisiteur(visiteurId: string): Promise<IPortefeuille[]> {
    return await PortefeuilleModel.find({ 
        visiteur: visiteurId,
        dateFinSuivi: null  // <--- C'est cette ligne qui filtre les "actifs" uniquement
      })
      .populate('praticien') 
      .sort({ dateDebutSuivi: -1 })
      .exec();
  }

  // Supprimer (Si tu gardes le hard delete, ça reste comme ça)
  public async retirer(visiteurId: string, praticienId: string): Promise<void> {
    const result = await PortefeuilleModel.findOneAndDelete({
      visiteur: visiteurId,
      praticien: praticienId
    });

    if (!result) {
      throw new Error("Ce praticien n'est pas dans le portefeuille de ce visiteur.");
    }
  }

/**
   * Clôturer le suivi d'un praticien (Soft Delete / Archivage)
   */
  public async terminerSuivi(visiteurId: string, praticienId: string): Promise<IPortefeuille> {
    const result = await PortefeuilleModel.findOneAndUpdate(
      { 
        visiteur: visiteurId, 
        praticien: praticienId,
        dateFinSuivi: null // On ne modifie que si le suivi est encore actif
      },
      { dateFinSuivi: new Date() }, // Mise à jour avec la date/heure actuelle
      { new: true } // Retourne l'objet modifié
    ).populate('praticien'); // Optionnel : pour renvoyer les infos du praticien archivé

    if (!result) {
      throw new Error("Impossible de terminer le suivi : lien inexistant ou déjà clôturé.");
    }

    return result;
  }

}