export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: number;
  completedAt?: string;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items?: ShoppingItem[];
  created_at?: string;
  createdAt?: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  quantity?: string;
  completed: number;
  completed_at?: string;
  completedAt?: string;
  created_at?: string;
  createdAt?: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  category_name?: string;
  category_color?: string;
  date: string;
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    reminders: Reminder[];
    shoppingLists: any[];
    transactions: Transaction[];
    categories: FinanceCategory[];
  };
}
