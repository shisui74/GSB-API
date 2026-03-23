import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PortefeuilleService } from '../services/Portefeuille';
import { PortefeuilleModel } from '../models/Portefeuille';

jest.mock('../models/Portefeuille');

describe('PortefeuilleService.getNombrePortefeuille', () => {
  let service: PortefeuilleService;

  beforeEach(() => {
    service = new PortefeuilleService();
    jest.clearAllMocks();
  });

  test('retourne le nombre total de praticiens dans le portefeuille', async () => {
    const visiteurId = '507f1f77bcf86cd799439011';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async (query: any) => {
        if (query.visiteur === visiteurId) {
          return 5;
        }
        return 0;
      }
    );

    const result = await service.getNombrePortefeuille(visiteurId);

    expect(result).toBe(5);
    expect(PortefeuilleModel.countDocuments).toHaveBeenCalledWith({ 
      visiteur: visiteurId 
    });
  });

  test('retourne 0 si aucun portefeuille trouvé', async () => {
    const visiteurId = '507f1f77bcf86cd799439012';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async () => 0
    );

    const result = await service.getNombrePortefeuille(visiteurId);

    expect(result).toBe(0);
    expect(PortefeuilleModel.countDocuments).toHaveBeenCalledWith({ 
      visiteur: visiteurId 
    });
  });

  test('lance une erreur si la requête échoue', async () => {
    const visiteurId = '507f1f77bcf86cd799439011';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async () => {
        throw new Error('Erreur base de données');
      }
    );

    await expect(service.getNombrePortefeuille(visiteurId)).rejects.toThrow(
      'Erreur lors du comptage du portefeuille'
    );
  });
});

describe('PortefeuilleService.getNombrePortefeuilleActif', () => {
  let service: PortefeuilleService;

  beforeEach(() => {
    service = new PortefeuilleService();
    jest.clearAllMocks();
  });

  test('retourne le nombre de praticiens actifs seulement', async () => {
    const visiteurId = '507f1f77bcf86cd799439011';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async (query: any) => {
        if (query.visiteur === visiteurId && query.dateFinSuivi === null) {
          return 3;
        }
        return 0;
      }
    );

    const result = await service.getNombrePortefeuilleActif(visiteurId);

    expect(result).toBe(3);
    expect(PortefeuilleModel.countDocuments).toHaveBeenCalledWith({ 
      visiteur: visiteurId,
      dateFinSuivi: null
    });
  });

  test('retourne 0 si aucun portefeuille actif', async () => {
    const visiteurId = '507f1f77bcf86cd799439012';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async () => 0
    );

    const result = await service.getNombrePortefeuilleActif(visiteurId);

    expect(result).toBe(0);
    expect(PortefeuilleModel.countDocuments).toHaveBeenCalledWith({ 
      visiteur: visiteurId,
      dateFinSuivi: null
    });
  });

  test('exclut les praticiens avec dateFinSuivi définie', async () => {
    const visiteurId = '507f1f77bcf86cd799439011';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async (query: any) => {
        // Le test vérifie que seuls les documents avec dateFinSuivi: null sont comptés
        if (query.visiteur === visiteurId && query.dateFinSuivi === null) {
          return 2;
        }
        return 0;
      }
    );

    const result = await service.getNombrePortefeuilleActif(visiteurId);

    expect(result).toBe(2);
  });

  test('lance une erreur si la requête échoue', async () => {
    const visiteurId = '507f1f77bcf86cd799439011';
    
    (PortefeuilleModel.countDocuments as unknown as jest.Mock).mockImplementation(
      async () => {
        throw new Error('Erreur base de données');
      }
    );

    await expect(service.getNombrePortefeuilleActif(visiteurId)).rejects.toThrow(
      'Erreur lors du comptage du portefeuille actif'
    );
  });
});
