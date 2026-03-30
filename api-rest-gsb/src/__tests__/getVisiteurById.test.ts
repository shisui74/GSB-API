import { describe, expect, jest, test, beforeEach } from '@jest/globals';
jest.mock('../models/Visiteur');

import { VisiteurService } from '../services/Visiteur';
import { VisiteurModel } from '../models/Visiteur';

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaire : construit le mock de la chaîne findById().select().exec()
// ─────────────────────────────────────────────────────────────────────────────
function mockFindById(resolvedValue: unknown) {
  const execMock = jest.fn<() => Promise<unknown>>().mockResolvedValue(resolvedValue);
  const selectMock = jest.fn().mockReturnValue({ exec: execMock });
  (VisiteurModel.findById as unknown as jest.Mock).mockReturnValue({ select: selectMock });
  return { selectMock, execMock };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE DE TESTS : VisiteurService.getVisiteurById
// ─────────────────────────────────────────────────────────────────────────────
describe('VisiteurService.getVisiteurById', () => {
  let service: VisiteurService;

  beforeEach(() => {
    service = new VisiteurService();
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 1 : ID valide, visiteur trouvé en base
  // Attendu : le service retourne l'objet visiteur
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scénario 1 – Visiteur trouvé avec succès', () => {
    test('retourne le visiteur correspondant à un ID valide', async () => {
      // ARRANGE
      const validId = '507f1f77bcf86cd799439011';
      const visiteurAttendu = {
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'marie.dupont@gsb.fr',
        telephone: '0612345678'
      };

      const { selectMock, execMock } = mockFindById(visiteurAttendu);

      // ACT
      const result = await service.getVisiteurById(validId);

      // ASSERT
      expect(result).toEqual(visiteurAttendu);
      expect(VisiteurModel.findById).toHaveBeenCalledWith(validId);
      expect(selectMock).toHaveBeenCalledWith('nom prenom email telephone -_id');
      expect(execMock).toHaveBeenCalledTimes(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 2 : ID valide mais aucun document en base (findById renvoie null)
  // Attendu : le service lève une erreur "introuvable"
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scénario 2 – Visiteur introuvable (null retourné par la base)', () => {
    test('lève une erreur quand aucun visiteur ne correspond à l\'ID', async () => {
      // ARRANGE
      const idInconnu = '507f1f77bcf86cd799439099';
      mockFindById(null); // la base ne trouve rien

      // ACT & ASSERT
      await expect(service.getVisiteurById(idInconnu)).rejects.toThrow(
        `Visiteur avec l'ID ${idInconnu} introuvable`
      );
      expect(VisiteurModel.findById).toHaveBeenCalledWith(idInconnu);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 3 : ID mal formé (Mongoose lève un CastError)
  // Attendu : le service lève une erreur "ID invalide"
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scénario 3 – ID invalide (CastError Mongoose)', () => {
    test('lève une erreur "ID invalide" quand l\'ID n\'est pas un ObjectId', async () => {
      // ARRANGE
      const idMalForme = 'abc123_pas_un_objectid';
      const castError = { name: 'CastError', message: 'Cast to ObjectId failed' };

      const execMock = jest.fn<() => Promise<never>>().mockRejectedValue(castError);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      (VisiteurModel.findById as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      // ACT & ASSERT
      await expect(service.getVisiteurById(idMalForme)).rejects.toThrow(
        `ID invalide: ${idMalForme}`
      );
      expect(VisiteurModel.findById).toHaveBeenCalledWith(idMalForme);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 4 : Panne base de données (erreur réseau inattendue)
  // Attendu : l'erreur est propagée telle quelle
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scénario 4 – Erreur base de données inattendue', () => {
    test('propage l\'erreur brute en cas de panne de la base', async () => {
      // ARRANGE
      const validId = '507f1f77bcf86cd799439011';
      const erreurReseau = new Error('MongoNetworkError: connexion refusée');

      const execMock = jest.fn<() => Promise<never>>().mockRejectedValue(erreurReseau);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      (VisiteurModel.findById as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      // ACT & ASSERT
      await expect(service.getVisiteurById(validId)).rejects.toThrow(
        'MongoNetworkError: connexion refusée'
      );
    });
  });
});
