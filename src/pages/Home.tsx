import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBadge,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { 
  calendarOutline, 
  cartOutline, 
  walletOutline,
  trendingUpOutline,
  trendingDownOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { DatabaseService } from '@services/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    pendingReminders: 0,
    pendingItems: 0,
    balance: 0,
    income: 0,
    expense: 0,
    nextReminder: null as any
  });

  const loadStats = async () => {
    const db = DatabaseService.getInstance();
    const database = await db.getDB();
    
    if (!database) return;

    // Lembretes pendentes
    const reminders = await database.query(
      'SELECT COUNT(*) as count FROM reminders WHERE completed = 0'
    );
    
    // Itens de compras pendentes
    const items = await database.query(
      'SELECT COUNT(*) as count FROM shopping_items WHERE completed = 0'
    );

    // Próximo lembrete
    const nextReminder = await database.query(
      `SELECT * FROM reminders 
       WHERE completed = 0 AND due_date IS NOT NULL 
       ORDER BY due_date ASC LIMIT 1`
    );

    // Saldo financeiro
    const income = await database.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    );
    const expense = await database.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    );

    const totalIncome = income.values?.[0]?.total || 0;
    const totalExpense = expense.values?.[0]?.total || 0;

    setStats({
      pendingReminders: reminders.values?.[0]?.count || 0,
      pendingItems: items.values?.[0]?.count || 0,
      balance: totalIncome - totalExpense,
      income: totalIncome,
      expense: totalExpense,
      nextReminder: nextReminder.values?.[0]
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    await loadStats();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>Início</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard className="fade-in" style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ color: 'white', fontSize: '1.2rem' }}>
                    Bem-vindo ao GreenManager
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ color: 'white' }}>
                  Organize sua vida de forma sustentável e eficiente
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonCard className="fade-in card-green" button routerLink="/reminders">
                <IonCardHeader>
                  <IonIcon icon={calendarOutline} style={{ fontSize: '32px', color: '#4CAF50' }} />
                  <IonCardTitle style={{ fontSize: '1rem', marginTop: '8px' }}>
                    Lembretes
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {stats.pendingReminders}
                  </h2>
                  <p>pendentes</p>
                  {stats.nextReminder && (
                    <IonBadge color="primary">
                      {format(new Date(stats.nextReminder.due_date), "dd/MM", { locale: ptBR })}
                    </IonBadge>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6">
              <IonCard className="fade-in card-green" button routerLink="/shopping">
                <IonCardHeader>
                  <IonIcon icon={cartOutline} style={{ fontSize: '32px', color: '#4CAF50' }} />
                  <IonCardTitle style={{ fontSize: '1rem', marginTop: '8px' }}>
                    Compras
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {stats.pendingItems}
                  </h2>
                  <p>itens pendentes</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard className="fade-in">
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem', color: '#1B5E20' }}>
                    Resumo Financeiro
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonRow>
                    <IonCol size="12">
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <h2 style={{ 
                          fontSize: '32px', 
                          fontWeight: 'bold',
                          color: stats.balance >= 0 ? '#4CAF50' : '#F44336'
                        }}>
                          R$ {stats.balance.toFixed(2)}
                        </h2>
                        <p>Saldo atual</p>
                      </div>
                    </IonCol>
                  </IonRow>
                  
                  <IonRow>
                    <IonCol size="6">
                      <div style={{ 
                        padding: '12px', 
                        background: '#E8F5E9', 
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <IonIcon icon={trendingUpOutline} style={{ color: '#4CAF50', fontSize: '24px' }} />
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Receitas</p>
                        <h3 style={{ margin: 0, color: '#4CAF50' }}>
                          R$ {stats.income.toFixed(2)}
                        </h3>
                      </div>
                    </IonCol>
                    
                    <IonCol size="6">
                      <div style={{ 
                        padding: '12px', 
                        background: '#FFEBEE', 
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <IonIcon icon={trendingDownOutline} style={{ color: '#F44336', fontSize: '24px' }} />
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Despesas</p>
                        <h3 style={{ margin: 0, color: '#F44336' }}>
                          R$ {stats.expense.toFixed(2)}
                        </h3>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {(stats.pendingReminders > 0 || stats.pendingItems > 0) && (
            <IonRow>
              <IonCol size="12">
                <IonCard style={{ background: '#FFF3E0' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon icon={alertCircleOutline} style={{ fontSize: '24px', color: '#FF9800', marginRight: '8px' }} />
                    <div>
                      <strong>Você tem {stats.pendingReminders + stats.pendingItems} itens pendentes</strong>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
