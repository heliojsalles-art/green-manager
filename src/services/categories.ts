import { DatabaseService } from './database';
import { FinanceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  private static instance: CategoryService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getAllCategories(type?: 'income' | 'expense'): Promise<FinanceCategory[]> {
    const database = await this.db.getDB();
    if (!database) return [];

    let query = 'SELECT * FROM finance_categories';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const result = await database.query(query, params);
    
    // Mapear os resultados para o formato esperado
    const categories = (result.values || []).map(cat => ({
      ...cat,
      isDefault: cat.is_default === 1,
      createdAt: cat.created_at
    }));

    return categories;
  }

  async addCategory(category: Omit<FinanceCategory, 'id' | 'createdAt' | 'isDefault'>): Promise<string> {
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

  async updateCategory(id: string, updates: Partial<FinanceCategory>): Promise<boolean> {
    const database = await this.db.getDB();
    if (!database) return false;

    // Verificar se é categoria padrão
    const category = await this.getCategoryById(id);
    if (category?.isDefault) {
      throw new Error('Não é possível editar categorias padrão');
    }

    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.name) {
      setClause.push('name = ?');
      params.push(updates.name);
    }
    if (updates.icon) {
      setClause.push('icon = ?');
      params.push(updates.icon);
    }
    if (updates.color) {
      setClause.push('color = ?');
      params.push(updates.color);
    }

    if (setClause.length === 0) return false;

    params.push(id);
    await database.run(
      `UPDATE finance_categories SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return true;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    const database = await this.db.getDB();
    if (!database) return { success: false, message: 'Database not initialized' };

    // Verificar se é categoria padrão
    const category = await this.getCategoryById(id);
    if (category?.isDefault) {
      return { success: false, message: 'Não é possível excluir categorias padrão' };
    }

    // Verificar se há transações usando esta categoria
    const transactions = await database.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id]
    );

    if (transactions.values?.[0]?.count > 0) {
      return { 
        success: false, 
        message: 'Não é possível excluir categoria com transações existentes' 
      };
    }

    await database.run('DELETE FROM finance_categories WHERE id = ?', [id]);
    return { success: true };
  }

  async getCategoryById(id: string): Promise<FinanceCategory | null> {
    const database = await this.db.getDB();
    if (!database) return null;

    const result = await database.query(
      'SELECT * FROM finance_categories WHERE id = ?',
      [id]
    );

    if (result.values?.[0]) {
      const cat = result.values[0];
      return {
        ...cat,
        isDefault: cat.is_default === 1,
        createdAt: cat.created_at
      };
    }

    return null;
  }

  async getCategoryStats(): Promise<{
    totalIncome: number;
    totalExpense: number;
    byCategory: { category: string; amount: number; type: string }[];
  }> {
    const database = await this.db.getDB();
    if (!database) {
      return { totalIncome: 0, totalExpense: 0, byCategory: [] };
    }

    // Total de receitas
    const incomeResult = await database.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?',
      ['income']
    );

    // Total de despesas
    const expenseResult = await database.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?',
      ['expense']
    );

    // Por categoria
    const byCategoryResult = await database.query(`
      SELECT 
        c.name as category,
        c.type,
        COALESCE(SUM(t.amount), 0) as amount
      FROM finance_categories c
      LEFT JOIN transactions t ON c.id = t.category_id
      GROUP BY c.id, c.name, c.type
      HAVING amount > 0
      ORDER BY amount DESC
    `);

    return {
      totalIncome: incomeResult.values?.[0]?.total || 0,
      totalExpense: expenseResult.values?.[0]?.total || 0,
      byCategory: byCategoryResult.values || []
    };
  }
}
