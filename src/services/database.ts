// Interface do banco de dados
export interface Database {
  connect: () => Promise<void>;
  query: (sql: string, params?: any[]) => Promise<any>;
  close: () => Promise<void>;
}

// Implementação simples
class DatabaseImpl implements Database {
  async connect() {
    console.log('Banco de dados conectado');
  }

  async query(sql: string, params?: any[]) {
    console.log('Query executada:', sql);
    return [];
  }

  async close() {
    console.log('Banco de dados fechado');
  }
}

// Função exportada
export const getDatabase = (): Database => {
  return new DatabaseImpl();
};

export default getDatabase;
