import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { DatabaseService } from './database';
import { BackupData, Reminder, ShoppingList, Transaction, FinanceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class BackupService {
  private static instance: BackupService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async exportBackup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const database = await this.db.getDB();
      if (!database) throw new Error('Database not initialized');

      // Buscar todos os dados
      const reminders = await database.query('SELECT * FROM reminders');
      const shoppingLists = await database.query('SELECT * FROM shopping_lists');
      const shoppingItems = await database.query('SELECT * FROM shopping_items');
      const transactions = await database.query('SELECT * FROM transactions');
      const categories = await database.query('SELECT * FROM finance_categories');

      // Estruturar dados
      const backupData: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          reminders: reminders.values || [],
          shoppingLists: this.organizeShoppingLists(shoppingLists.values || [], shoppingItems.values || []),
          transactions: transactions.values || [],
          categories: categories.values || []
        }
      };

      // Criar arquivo
      const jsonString = JSON.stringify(backupData, null, 2);
      const fileName = `greenmanager_backup_${Date.now()}.json`;

      let filePath: string;

      if (Capacitor.isNativePlatform()) {
        // Salvar no dispositivo
        const result = await Filesystem.writeFile({
          path: `Documents/${fileName}`,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        filePath = result.uri;
      } else {
        // Web: download automático
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        filePath = fileName;
      }

      return { success: true, filePath };
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      return { success: false, error: String(error) };
    }
  }

  async importBackup(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Ler arquivo
      const contents = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      const backupData: BackupData = JSON.parse(contents.data as string);

      // Validar versão
      if (!backupData.version || !backupData.data) {
        throw new Error('Arquivo de backup inválido');
      }

      const database = await this.db.getDB();
      if (!database) throw new Error('Database not initialized');

      // Iniciar transação
      await database.run('BEGIN TRANSACTION');

      try {
        // Limpar dados existentes (manter categorias padrão)
        await database.run('DELETE FROM reminders');
        await database.run('DELETE FROM shopping_items');
        await database.run('DELETE FROM shopping_lists');
        await database.run('DELETE FROM transactions');
        await database.run('DELETE FROM finance_categories WHERE is_default = 0');

        // Restaurar categorias
        for (const cat of backupData.data.categories) {
          await database.run(
            'INSERT OR REPLACE INTO finance_categories (id, name, type, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.is_default || 0, cat.created_at]
          );
        }

        // Restaurar transações
        for (const trans of backupData.data.transactions) {
          await database.run(
            'INSERT INTO transactions (id, description, amount, type, category_id, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [trans.id, trans.description, trans.amount, trans.type, trans.category_id, trans.date, trans.notes, trans.created_at]
          );
        }

        // Restaurar lembretes
        for (const rem of backupData.data.reminders) {
          await database.run(
            'INSERT INTO reminders (id, title, description, due_date, completed, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rem.id, rem.title, rem.description, rem.due_date, rem.completed, rem.completed_at, rem.created_at]
          );
        }

        // Restaurar listas e itens
        for (const list of backupData.data.shoppingLists) {
          await database.run(
            'INSERT INTO shopping_lists (id, name, created_at) VALUES (?, ?, ?)',
            [list.id, list.name, list.created_at]
          );

          for (const item of list.items) {
            await database.run(
              'INSERT INTO shopping_items (id, list_id, name, quantity, completed, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [item.id, list.id, item.name, item.quantity, item.completed, item.completed_at, item.created_at]
            );
          }
        }

        // Commit transação
        await database.run('COMMIT');

        return { success: true };
      } catch (error) {
        // Rollback em caso de erro
        await database.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      return { success: false, error: String(error) };
    }
  }

  async listBackups(): Promise<{ name: string; path: string; size: number; modified: number }[]> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return [];
      }

      const result = await Filesystem.readdir({
        path: 'Documents/',
        directory: Directory.Documents
      });

      const backups = result.files
        .filter(file => file.name.startsWith('greenmanager_backup') && file.name.endsWith('.json'))
        .map(file => ({
          name: file.name,
          path: `Documents/${file.name}`,
          size: file.size || 0,
          modified: file.modified || 0
        }))
        .sort((a, b) => b.modified - a.modified);

      return backups;
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  private organizeShoppingLists(lists: any[], items: any[]): any[] {
    return lists.map(list => ({
      ...list,
      items: items.filter(item => item.list_id === list.id)
    }));
  }
}
