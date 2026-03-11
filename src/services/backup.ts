import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import DatabaseService from './database';
import { BackupData, Reminder, ShoppingList, Transaction, FinanceCategory } from '../types';

export class BackupService {
  private static instance: BackupService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  public async exportBackup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const database = await this.db.getDB();
      if (!database) throw new Error('Database not initialized');

      const remindersResult = await database.query('SELECT * FROM reminders');
      const shoppingListsResult = await database.query('SELECT * FROM shopping_lists');
      const shoppingItemsResult = await database.query('SELECT * FROM shopping_items');
      const transactionsResult = await database.query('SELECT * FROM transactions');
      const categoriesResult = await database.query('SELECT * FROM finance_categories');

      const backupData: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          reminders: remindersResult.values || [],
          shoppingLists: this.organizeShoppingLists(shoppingListsResult.values || [], shoppingItemsResult.values || []),
          transactions: transactionsResult.values || [],
          categories: (categoriesResult.values || []).map(cat => ({
            ...cat,
            isDefault: cat.is_default === 1,
            createdAt: cat.created_at
          }))
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const fileName = `greenmanager_backup_${Date.now()}.json`;

      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: `Documents/${fileName}`,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        return { success: true, filePath: result.uri };
      }
      
      // Web download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, filePath: fileName };
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      return { success: false, error: String(error) };
    }
  }

  public async listBackups(): Promise<{ name: string; path: string; size: number }[]> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return [];
      }

      const result = await Filesystem.readdir({
        path: 'Documents/',
        directory: Directory.Documents
      });

      return result.files
        .filter(file => file.name.startsWith('greenmanager_backup') && file.name.endsWith('.json'))
        .map(file => ({
          name: file.name,
          path: `Documents/${file.name}`,
          size: file.size || 0
        }));
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

export default BackupService;
