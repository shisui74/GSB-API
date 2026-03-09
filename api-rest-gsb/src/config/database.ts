import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();


/**
 * Classe pour gérer la connexion à MongoDB
 * Utilisation du pattern Singleton pour garantir une seule instance
 */
export class Database {
  private static instance: Database;
  private isConnected: boolean = false;


  private constructor() {}


  /**
   * Récupère l'instance unique de Database (Singleton)
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }


  /**
   * Établit la connexion à MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Déjà connecté à MongoDB');
      return;
    }


  try {
      const dbUsername = process.env.DB_USERNAME;
      const dbPassword = process.env.DB_PASSWORD;
      const dbName = process.env.DB_NAME || 'api-rest-express';

      console.log('Connecting to MongoDB with:', dbUsername, dbPassword, dbName);

      if (!dbUsername || !dbPassword) {
        throw new Error('DB_USERNAME et DB_PASSWORD sont obligatoires dans .env');
      }


      const encodedPassword = encodeURIComponent(dbPassword);
      const mongoUri = `mongodb+srv://${dbUsername}:${encodedPassword}@cluster0.g7h7vvl.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;


      await mongoose.connect(mongoUri);
      this.isConnected = true;
     
      console.log('Connexion à MongoDB Atlas réussie');
    } catch (error) {
      console.error('Erreur de connexion à MongoDB:', error);
      process.exit(1);
    }
  }
  /**
   * Ferme la connexion à MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }


    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Déconnexion de MongoDB réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }
}
