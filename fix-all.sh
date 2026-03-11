#!/bin/bash

echo "🛠️  Iniciando correção do projeto GreenManager..."

# 1. Remover aliases do TypeScript e usar caminhos relativos
echo "📝 Corrigindo imports para usar caminhos relativos..."

# Corrigir App.tsx
cat > src/App.tsx << 'EOF'
import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

// Importar páginas com caminhos relativos
import Home from './pages/Home';
import Reminders from './pages/Reminders';
import ShoppingLists from './pages/ShoppingLists';
import Finances from './pages/Finances';
import Settings from './pages/Settings';

// Importar componentes com caminhos relativos
import Menu from './components/common/Menu';

// Importar serviços com caminhos relativos
import { DatabaseService } from './services/database';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      const db = DatabaseService.getInstance();
      await db.initDB();
      
      // Configurar limpeza automática (24h)
      setInterval(() => {
        db.cleanupCompletedItems();
      }, 60 * 60 * 1000); // A cada hora
    };
    
    initApp();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/" component={Home} exact />
            <Route path="/reminders" component={Reminders} exact />
            <Route path="/shopping" component={ShoppingLists} exact />
            <Route path="/finances" component={Finances} exact />
            <Route path="/settings" component={Settings} exact />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
EOF

# Corrigir Home.tsx
cat > src/pages/Home.tsx << 'EOF'
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
  trendingUpOutline,
  trendingDownOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { DatabaseService } from '../services/database';
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

    const reminders = await database.query(
      'SELECT COUNT(*) as count FROM reminders WHERE completed = 0'
    );
    
    const items = await database.query(
      'SELECT COUNT(*) as count FROM shopping_items WHERE completed = 0'
    );

    const nextReminder = await database.query(
      `SELECT * FROM reminders 
       WHERE completed = 0 AND due_date IS NOT NULL 
       ORDER BY due_date ASC LIMIT 1`
    );

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
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
EOF

# Corrigir Settings.tsx
cat > src/pages/Settings.tsx << 'EOF'
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
  IonToggle,
  IonButton,
  IonIcon,
  IonAlert,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonModal
} from '@ionic/react';
import {
  moonOutline,
  sunnyOutline,
  cloudUploadOutline,
  cloudDownloadOutline,
  listOutline,
  trashOutline
} from 'ionicons/icons';
import { BackupService } from '../services/backup';
import { CategoryService } from '../services/categories';
import { DatabaseService } from '../services/database';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState('');

  const backupService = BackupService.getInstance();
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadSettings();
    loadBackups();
    loadCategories();
  }, []);

  const loadSettings = async () => {
    const { value } = await Preferences.get({ key: 'darkMode' });
    setDarkMode(value === 'true');
    if (value === 'true') {
      document.body.classList.add('dark');
    }
  };

  const loadBackups = async () => {
    const backupList = await backupService.listBackups();
    setBackups(backupList);
  };

  const loadCategories = async () => {
    const cats = await categoryService.getAllCategories();
    setCategories(cats);
  };

  const toggleDarkMode = async (checked: boolean) => {
    setDarkMode(checked);
    await Preferences.set({ key: 'darkMode', value: String(checked) });
    if (checked) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleExportBackup = async () => {
    setLoading(true);
    const result = await backupService.exportBackup();
    setLoading(false);
    
    if (result.success) {
      setToastMessage('Backup exportado com sucesso!');
      loadBackups();
    } else {
      setToastMessage('Erro ao exportar backup: ' + result.error);
    }
    setShowToast(true);
  };

  const handleImportBackup = async (filePath: string) => {
    setLoading(true);
    const result = await backupService.importBackup(filePath);
    setLoading(false);
    
    setToastMessage(result.success ? 'Backup importado com sucesso!' : 'Erro ao importar backup');
    setShowToast(true);
    setShowBackupModal(false);
  };

  const handleDeleteBackup = async (filePath: string) => {
    setSelectedBackup(filePath);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBackup = async () => {
    setLoading(true);
    try {
      await Filesystem.deleteFile({
        path: selectedBackup,
        directory: Directory.Documents
      });
      setToastMessage('Backup excluído com sucesso!');
      loadBackups();
    } catch (error) {
      setToastMessage('Erro ao excluir backup');
    }
    setLoading(false);
    setShowDeleteConfirm(false);
    setShowToast(true);
  };

  const handleClearAllData = async () => {
    setLoading(true);
    try {
      const db = DatabaseService.getInstance();
      const database = await db.getDB();
      
      if (database) {
        await database.run('DELETE FROM reminders');
        await database.run('DELETE FROM shopping_items');
        await database.run('DELETE FROM shopping_lists');
        await database.run('DELETE FROM transactions');
        await database.run('DELETE FROM finance_categories WHERE is_default = 0');
        
        setToastMessage('Dados limpos com sucesso!');
      }
    } catch (error) {
      setToastMessage('Erro ao limpar dados');
    }
    setLoading(false);
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>Configurações</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Processando..." />
        
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />

        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonIcon icon={darkMode ? moonOutline : sunnyOutline} slot="start" />
                      <IonLabel>Modo Escuro</IonLabel>
                      <IonToggle
                        checked={darkMode}
                        onIonChange={e => toggleDarkMode(e.detail.checked)}
                      />
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardContent>
                  <IonList>
                    <IonItem button onClick={handleExportBackup}>
                      <IonIcon icon={cloudUploadOutline} slot="start" color="primary" />
                      <IonLabel>Exportar Backup</IonLabel>
                    </IonItem>
                    
                    <IonItem button onClick={() => setShowBackupModal(true)}>
                      <IonIcon icon={cloudDownloadOutline} slot="start" color="primary" />
                      <IonLabel>Importar Backup</IonLabel>
                    </IonItem>
                    
                    <IonItem button onClick={() => setShowCategoryModal(true)}>
                      <IonIcon icon={listOutline} slot="start" color="primary" />
                      <IonLabel>Gerenciar Categorias</IonLabel>
                    </IonItem>
                    
                    <IonItem button onClick={handleClearAllData}>
                      <IonIcon icon={trashOutline} slot="start" color="danger" />
                      <IonLabel color="danger">Limpar Todos os Dados</IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardContent>
                  <h3 style={{ color: '#4CAF50', marginBottom: '16px' }}>Sobre o App</h3>
                  <p><strong>GreenManager</strong> - Versão 1.0.0</p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    App desenvolvido para organizar sua vida com um toque verde.
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonModal isOpen={showBackupModal} onDidDismiss={() => setShowBackupModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Importar Backup</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowBackupModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {backups.length === 0 ? (
                <IonItem>
                  <IonLabel>Nenhum backup encontrado</IonLabel>
                </IonItem>
              ) : (
                backups.map((backup, index) => (
                  <IonItem key={index}>
                    <IonLabel>
                      <h3>{backup.name}</h3>
                      <p>Tamanho: {(backup.size / 1024).toFixed(
