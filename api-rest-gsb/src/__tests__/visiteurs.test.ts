import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.mock('../models/Visiteur');


import { VisiteurService } from '../services/Visiteur';
import { VisiteurModel } from '../models/Visiteur';
import { ICreateVisiteur } from '../models/interfaces/IVisiteur';


describe('VisiteurService.createVisiteur', () => {
  let service: VisiteurService;


  beforeEach(() => {
    service = new VisiteurService();
    jest.clearAllMocks();
  });


  describe('Création d\'un visiteur réussie', () => {
    test('crée un visiteur si email libre et données valides', async () => {
      // ARRANGE
      const visiteurData:  ICreateVisiteur = {
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'marie.dupont@test.com',
        telephone: '0612345678'
      };


      const expectedVisiteur = {
        ...visiteurData,
        _id: '507f1f77bcf86cd799439011',
        createdAt: new Date(),
        updatedAt:  new Date()
      };


      // Mock findOne :  email n'existe pas
      (VisiteurModel.findOne as unknown as jest.Mock).mockImplementation(async () => null);


      // Mock constructeur et save
      const mockVisiteurInstance = {
        ... expectedVisiteur,
        save: jest.fn().mockImplementation(async () => expectedVisiteur)
      };


      (VisiteurModel as any).mockImplementation(() => mockVisiteurInstance);


      // ACT
      const result = await service.createVisiteur(visiteurData);


      // ASSERT
      expect(result).toBeDefined();
      expect(result.email).toBe('marie.dupont@test.com');
      expect(VisiteurModel.findOne).toHaveBeenCalledWith({ email: 'marie.dupont@test.com' });
      expect(mockVisiteurInstance.save).toHaveBeenCalled();
    });
  });

  describe('Cas d\'erreur : email déjà existant', () => {
    test('lance une erreur et ne sauvegarde pas', async () => {
      const visiteurData: ICreateVisiteur = {
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'marie.dupont@test.com',
        telephone: '0612345678'
      };

      const existingVisiteur = {
        _id: '507f1f77bcf86cd799439012',
        ...visiteurData
      };

      const saveMock = jest.fn();
      (VisiteurModel as unknown as jest.Mock).mockImplementation(() => ({ save: saveMock }));
      (VisiteurModel.findOne as unknown as jest.Mock).mockImplementation(async () => existingVisiteur);

      await expect(service.createVisiteur(visiteurData)).rejects.toThrow(
        "Un visiteur avec l'email marie.dupont@test.com existe déjà"
      );

      expect(VisiteurModel.findOne).toHaveBeenCalledWith({ email: 'marie.dupont@test.com' });
      expect(saveMock).not.toHaveBeenCalled();
    });
  });

  describe('Cas d\'erreur : ValidationError Mongoose', () => {
    test('formate les erreurs de validation dans le message', async () => {
      const visiteurData: ICreateVisiteur = {
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'email-invalide',
        telephone: ''
      };

      const validationError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email invalide' },
          telephone: { message: 'Le téléphone est obligatoire' }
        }
      };

      (VisiteurModel.findOne as unknown as jest.Mock).mockImplementation(async () => null);

      const saveMock = jest.fn().mockImplementation(async () => {
        throw validationError;
      });

      (VisiteurModel as unknown as jest.Mock).mockImplementation(() => ({ save: saveMock }));

      let errorMessage = '';
      try {
        await service.createVisiteur(visiteurData);
      } catch (error: any) {
        errorMessage = error.message;
      }

      expect(errorMessage).toContain('Validation échouée:');
      expect(errorMessage).toContain('Email invalide');
      expect(errorMessage).toContain('Le téléphone est obligatoire');

      expect(VisiteurModel.findOne).toHaveBeenCalledWith({ email: 'email-invalide' });
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });
});
