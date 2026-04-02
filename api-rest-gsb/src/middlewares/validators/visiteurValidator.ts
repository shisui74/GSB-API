import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Règles de validation pour la création d'un visiteur
 * On vérifie les types, les formats et on nettoie (sanitize) les entrées
 */
export const validateCreateVisiteur = [
  // 1. Validation du NOM
  body('nom')
    .trim() // Enlève les espaces inutiles
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le nom contient des caractères invalides')
    .escape(), // Protège contre les injections XSS

  // 2. Validation du PRÉNOM
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Le prénom contient des caractères invalides')
    .escape(),

  // 3. Validation de l'EMAIL
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(), // Transforme en minuscules, etc.

  // 4. Validation du TÉLÉPHONE (Optionnel mais formaté si présent)
  body('tel')
    .optional()
    .trim()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/).withMessage("Format de téléphone invalide (ex: 06 12 34 56 78)"),

  // 5. Validation de l'ADRESSE (Rue, CP, Ville)
  body('rue').optional().trim().escape(),
  body('cp')
    .optional()
    .trim()
    .isPostalCode('FR').withMessage("Code postal invalide"),
  body('ville').optional().trim().escape(),

  // 6. Middleware pour traiter les erreurs
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Si on a des erreurs, on renvoie une 400 Bad Request immédiatement
      // On ne va PAS plus loin (pas de controller, pas de service, pas de BDD)
      return res.status(400).json({
        success: false,
        message: "Échec de la validation des données",
        errors: errors.array()
      });
    }
    
    return next(); // Tout est bon, on passe au controller
  }
];