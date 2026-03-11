// Arquivo: src/services/database.ts
export const getDatabase = async () => {
  // Implementação real do seu banco de dados
  // Exemplo com SQLite ou localStorage
  return {
    select: async <T>(query: string): Promise<T[]> => {
      console.log('Executando query:', query);
      return [];
    },
    run: async (query: string, params: any[]): Promise<void> => {
      console.log('Executando query:', query, params);
    }
  };
};
