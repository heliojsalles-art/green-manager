import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { addOutline, trendingUpOutline, trendingDownOutline, walletOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database';
import { CategoryService } from '../services/categories';
import { Transaction, FinanceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Finances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction>>({});
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const db = DatabaseService.getInstance();
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadCategories();
    await loadTransactions();
    await calculateBalance();
  };

  const loadCategories = async () => {
    const cats = await categoryService.getAllCategories();
    setCategories(cats);
  };

  const loadTransactions = async () => {
    const database = await db.getDB();
    if (!database) return;

    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color 
      FROM transactions t
      LEFT JOIN finance_categories c ON t.category_id = c.id
    `;
    
    if (selectedType !== 'all') {
      query += ` WHERE t.type = '${selectedType}'`;
    }
    
    query += ' ORDER BY t.date DESC';

    const result = await database.query(query);
    setTransactions(result.values || []);
  };

  const calculateBalance = async () => {
    const database = await db.getDB();
    if (!database) return;

    const incomeResult = await database.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    );
    const expenseResult = await database.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    );

    const totalIncome = incomeResult.values?.[0]?.total || 0;
    const totalExpense = expenseResult.values?.[0]?.total || 0;

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  };

  const handleSave = async () => {
    if (!editingTransaction.description || !editingTransaction.amount || !editingTransaction.categoryId) {
      setToastMessage('Preencha todos os campos obrigatórios');
      setShowToast(true);
      return;
    }

    const database = await db.getDB();
    if (!database) return;

    if (editingTransaction.id) {
      await database.run(
        `UPDATE transactions 
         SET description = ?, amount = ?, type = ?, category_id = ?, notes = ?, date = ?
         WHERE id = ?`,
        [
          editingTransaction.description,
          editingTransaction.amount,
          editingTransaction.type,
          editingTransaction.categoryId,
          editingTransaction.notes,
          editingTransaction.date || new Date().toISOString(),
          editingTransaction.id
        ]
      );
    } else {
      const id = uuidv4();
      await database.run(
        `INSERT INTO transactions (id, description, amount, type, category_id, notes, date, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          editingTransaction.description,
          editingTransaction.amount,
          editingTransaction.type || 'expense',
          editingTransaction.categoryId,
          editingTransaction.notes,
          editingTransaction.date || new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }

    setShowModal(false);
    setEditingTransaction({});
    await loadTransactions();
    await calculateBalance();
  };

  const deleteTransaction = async (id: string) => {
    const database = await db.getDB();
    if (!database) return;

    await database.run('DELETE FROM transactions WHERE id = ?', [id]);
    await loadTransactions();
    await calculateBalance();
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
    setSelectedType(type);
    loadTransactions();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>Finanças</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Saldo Atual</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold',
                    color: balance >= 0 ? '#4CAF50' : '#F44336'
                  }}>
                    R$ {balance.toFixed(2)}
                  </h2>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonCard style={{ background: '#E8F5E9' }}>
                <IonCardContent>
                  <IonIcon icon={trendingUpOutline} style={{ color: '#4CAF50', fontSize: '24px' }} />
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Receitas</p>
                  <h3 style={{ margin: 0, color: '#4CAF50' }}>
                    R$ {income.toFixed(2)}
                  </h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard style={{ background: '#FFEBEE' }}>
                <IonCardContent>
                  <IonIcon icon={trendingDownOutline} style={{ color: '#F44336', fontSize: '24px' }} />
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Despesas</p>
                  <h3 style={{ margin: 0, color: '#F44336' }}>
                    R$ {expense.toFixed(2)}
                  </h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonSegment value={selectedType} onIonChange={e => handleTypeChange(e.detail.value as any)}>
                <IonSegmentButton value="all">
                  <IonLabel>Todas</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="income">
                  <IonLabel>Receitas</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="expense">
                  <IonLabel>Despesas</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonList>
                {transactions.length === 0 ? (
                  <IonItem>
                    <IonLabel className="ion-text-center">
                      Nenhuma transação encontrada
                    </IonLabel>
                  </IonItem>
                ) : (
                  transactions.map(trans => (
                    <IonItem key={trans.id}>
                      <IonLabel>
                        <h3>{trans.description}</h3>
                        <p style={{ fontSize: '12px' }}>
                          {format(new Date(trans.date), "dd 'de' MMMM", { locale: ptBR })} • {trans.category_name}
                        </p>
                      </IonLabel>
                      <div slot="end" style={{ textAlign: 'right' }}>
                        <p className={trans.type === 'income' ? 'finance-income' : 'finance-expense'}>
                          {trans.type === 'income' ? '+' : '-'} R$ {Number(trans.amount).toFixed(2)}
                        </p>
                        <IonButton
                          fill="clear"
                          size="small"
                          color="danger"
                          onClick={() => deleteTransaction(trans.id)}
                        >
                          Excluir
                        </IonButton>
                      </div>
                    </IonItem>
                  ))
                )}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => {
            setEditingTransaction({ type: 'expense' });
            setShowModal(true);
          }}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nova Transação</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonSegment
              value={editingTransaction.type}
              onIonChange={e => setEditingTransaction({ ...editingTransaction, type: e.detail.value as 'income' | 'expense' })}
            >
              <IonSegmentButton value="income">
                <IonLabel>Receita</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="expense">
                <IonLabel>Despesa</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <IonInput
              label="Descrição"
              labelPlacement="stacked"
              placeholder="Ex: Salário"
              value={editingTransaction.description}
              onIonChange={e => setEditingTransaction({ ...editingTransaction, description: e.detail.value! })}
            />

            <IonInput
              type="number"
              label="Valor"
              labelPlacement="stacked"
              placeholder="0,00"
              value={editingTransaction.amount}
              onIonChange={e => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.detail.value!) })}
            />

            <IonSelect
              label="Categoria"
              placeholder="Selecione uma categoria"
              value={editingTransaction.categoryId}
              onIonChange={e => setEditingTransaction({ ...editingTransaction, categoryId: e.detail.value })}
            >
              {categories
                .filter(cat => cat.type === editingTransaction.type)
                .map(cat => (
                  <IonSelectOption key={cat.id} value={cat.id}>
                    {cat.name}
                  </IonSelectOption>
                ))}
            </IonSelect>

            <IonInput
              label="Observações"
              labelPlacement="stacked"
              placeholder="Observações (opcional)"
              value={editingTransaction.notes}
              onIonChange={e => setEditingTransaction({ ...editingTransaction, notes: e.detail.value! })}
            />

            <IonButton expand="block" onClick={handleSave} className="ion-margin-top">
              Salvar
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Finances;
