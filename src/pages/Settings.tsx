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
import BackupService from '../services/backup';
import CategoryService from '../services/categories';
import DatabaseService from '../services/database';
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
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonModal isOpen={showBackupModal} onDidDismiss={() => setShowBackupModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Backups Disponíveis</IonTitle>
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
                      <h2>{backup.name}</h2>
                      <p>Tamanho: {(backup.size / 1024).toFixed(2)} KB</p>
                    </IonLabel>
                  </IonItem>
                ))
              )}
            </IonList>
          </IonContent>
        </IonModal>

        <IonModal isOpen={showCategoryModal} onDidDismiss={() => setShowCategoryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Categorias</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowCategoryModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {categories.map(cat => (
                <IonItem key={cat.id}>
                  <IonLabel>
                    <h2>{cat.name}</h2>
                    <p>{cat.type === 'income' ? 'Receita' : 'Despesa'}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
