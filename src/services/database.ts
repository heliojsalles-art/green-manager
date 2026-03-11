// Interface do banco de dados
export interface Database {
  connect: () => Promise<void>;
  query: (sql: string, params?: any[]) => Promise<any[]>;
  close: () => Promise<void>;
  getInstance?: () => Database;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}

// Classe DatabaseService com padrão Singleton
export class DatabaseService {
  private static instance: DatabaseService;
  private connected: boolean = false;
  private database: Database;

  private constructor() {
    this.database = {
      connect: async () => {
        this.connected = true;
        console.log('✅ Banco de dados conectado');
      },
      query: async (sql: string, params?: any[]) => {
        console.log('📊 Query executada:', sql, params);
        return [];
      },
      close: async () => {
        this.connected = false;
        console.log('🔒 Banco de dados fechado');
      }
    };
  }

  // Método estático para obter a instância única
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Métodos públicos
  public async connect(): Promise<void> {
    await this.database.connect();
  }

  public async query(sql: string, params?: any[]): Promise<any[]> {
    return await this.database.query(sql, params);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public getDatabase(): Database {
    return this.database;
  }
}

// Função auxiliar para compatibilidade
export const getDatabase = (): Database => {
  const service = DatabaseService.getInstance();
  return service.getDatabase();
};

// Exportação padrão
export default DatabaseService;
