import { getDatabase } from './database';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  category_name: string;
  createdAt: Date; // ADICIONADO
  date: string;
}

export const createBackup = async () => {
  const db = await getDatabase();
  const transactions = await db.select<Transaction[]>('SELECT * FROM transactions');
  
  // Agora transactions tem a propriedade createdAt
  const backupData = {
    transactions: transactions.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString() // Agora funciona!
    })),
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(backupData, null, 2);
};

export const restoreBackup = async (backupJson: string) => {
  const backup = JSON.parse(backupJson);
  const db = await getDatabase();
  
  for (const transaction of backup.transactions) {
    await db.run(
      'INSERT INTO transactions (id, description, amount, type, category, category_name, createdAt, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transaction.id, transaction.description, transaction.amount, transaction.type, transaction.category, transaction.category_name, new Date(transaction.createdAt), transaction.date]
    );
  }
};
