import { describe, expect, test } from '@jest/globals';
import { VisiteurModel } from '../models/Visiteur';

describe('VisiteurModel.isJunior', () => {
  test('retourne true si dateEmbauche absente', () => {
    const visiteur = new VisiteurModel({
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.sansdate@test.com',
      telephone: '0612345678'
    });

    expect(visiteur.isJunior()).toBe(true);
  });

  test('retourne true si embauche il y a moins de 1 an', () => {
    const dateRecente = new Date();
    dateRecente.setMonth(dateRecente.getMonth() - 6);

    const visiteur = new VisiteurModel({
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.recente@test.com',
      telephone: '0612345678',
      dateEmbauche: dateRecente
    });

    expect(visiteur.isJunior()).toBe(true);
  });

  test('retourne false si embauche il y a plus de 1 an', () => {
    const dateAncienne = new Date();
    dateAncienne.setFullYear(dateAncienne.getFullYear() - 2);

    const visiteur = new VisiteurModel({
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie.ancienne@test.com',
      telephone: '0612345678',
      dateEmbauche: dateAncienne
    });

    expect(visiteur.isJunior()).toBe(false);
  });
});
