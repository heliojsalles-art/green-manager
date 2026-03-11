export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: Date;
  notes?: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    reminders: Reminder[];
    shoppingLists: ShoppingList[];
    transactions: Transaction[];
    categories: FinanceCategory[];
  };
}
