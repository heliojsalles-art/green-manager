import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private static instance: DatabaseService;
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  private constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initDB(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Criar conexão
      await this.sqlite.createConnection(
        'greenmanager',
        false,
        'no-encryption',
        1,
        false
      );

      this.db = await this.sqlite.retrieveConnection('greenmanager', false);

      if (this.db) {
        await this.createTables();
        await this.initDefaultCategories();
        this.isInitialized = true;
        console.log('Database initialized successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const queries = `
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shopping_items (
        id TEXT PRIMARY KEY NOT NULL,
        list_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS finance_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')),
        icon TEXT,
        color TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')),
        category_id TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES finance_categories(id)
      );

      CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(completed);
      CREATE INDEX IF NOT EXISTS idx_shopping_items_completed ON shopping_items(completed);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `;

    await this.db.execute(queries);
  }

  private async initDefaultCategories(): Promise<void> {
    if (!this.db) return;

    const defaultCategories = [
      ['Salário', 'income', 'cash-outline', '#4CAF50', 1],
      ['Alimentação', 'expense', 'restaurant-outline', '#FF5722', 1],
      ['Transporte', 'expense', 'car-outline', '#2196F3', 1],
      ['Moradia', 'expense', 'home-outline', '#9C27B0', 1],
      ['Saúde', 'expense', 'fitness-outline', '#F44336', 1],
      ['Educação', 'expense', 'school-outline', '#FF9800', 1],
      ['Lazer', 'expense', 'game-controller-outline', '#E91E63', 1],
      ['Compras', 'expense', 'cart-outline', '#795548', 1]
    ];

    for (const cat of defaultCategories) {
      await this.db.run(
        `INSERT OR IGNORE INTO finance_categories (id, name, type, icon, color, is_default) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), ...cat]
      );
    }
  }

  async cleanupCompletedItems(): Promise<void> {
    if (!this.db) return;

    // Remover lembretes completados há mais de 24 horas
    await this.db.run(`
      DELETE FROM reminders 
      WHERE completed = 1 
      AND datetime(completed_at) < datetime('now', '-1 day')
    `);

    // Remover itens de compras completados há mais de 24 horas
    await this.db.run(`
      DELETE FROM shopping_items 
      WHERE completed = 1 
      AND datetime(completed_at) < datetime('now', '-1 day')
    `);
  }

  async getDB(): Promise<SQLiteDBConnection | null> {
    if (!this.isInitialized) {
      await this.initDB();
    }
    return this.db;
  }

  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection('greenmanager', false);
      this.db = null;
      this.isInitialized = false;
    }
  }
}
