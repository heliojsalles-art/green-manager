import { DatabaseService } from './database';
import { Database } from './database';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
}

export class CategoryService {
  private dbService: DatabaseService;
  private database: Database;

  constructor() {
    this.dbService = DatabaseService.getInstance();
    this.database = this.dbService.getDatabase();
  }

  async getAllCategories(): Promise<Category[]> {
    await this.database.connect();
    return [
      {
        id: '1',
        name: 'Categoria 1',
        description: 'Descrição 1',
        color: '#4CAF50',
        createdAt: new Date()
      }
    ];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    await this.database.connect();
    return {
      id,
      name: 'Categoria Exemplo',
      createdAt: new Date()
    };
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    await this.database.connect();
    const newCategory: Category = {
      id: Date.now().toString(),
      ...category,
      createdAt: new Date()
    };
    console.log('✅ Categoria criada:', newCategory);
    return newCategory;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.database.connect();
    console.log('📝 Categoria atualizada:', id, data);
    return null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.database.connect();
    console.log('🗑️ Categoria deletada:', id);
    return true;
  }
}

// Exportar instância única
export const categoryService = new CategoryService();
export default categoryService;
