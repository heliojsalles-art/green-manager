import DatabaseService from './database';
import { FinanceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  private static instance: CategoryService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  public async getAllCategories(type?: 'income' | 'expense'): Promise<FinanceCategory[]> {
    const database = await this.db.getDB();
    if (!database) return [];

    let query = 'SELECT * FROM finance_categories';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    try {
      const result = await database.query(query, params);
      
      return (result.values || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: cat.is_default === 1,
        createdAt: cat.created_at
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  public async addCategory(category: Omit<FinanceCategory, 'id' | 'createdAt' | 'isDefault'>): Promise<string> {
    const database = await this.db.getDB();
    if (!database) throw new Error('Database not initialized');

    const id = uuidv4();
    await database.run(
      `INSERT INTO finance_categories (id, name, type, icon, color, is_default, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, category.name, category.type, category.icon || 'pricetag-outline', category.color || '#4CAF50', 0, new Date().toISOString()]
    );

    return id;
  }
}

export default CategoryService;
