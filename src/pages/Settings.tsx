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
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import {
  moonOutline,
  sunnyOutline,
  cloudUploadOutline,
  cloudDownloadOutline,
  listOutline,
  trashOutline,
  addOutline,
  colorPaletteOutline
} from 'ionicons/icons';
import { BackupService } from '@services/backup';
import { CategoryService } from '@services/categories';
import { DatabaseService } from '@services/database';
import { Preferences } from '@capacitor/preferences';
import { greenTheme, darkTheme } from '@theme/colors';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
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
        // Manter categorias padrão
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
                    Combine perfeitamente com seu iPhone 15 Verde! 🌿
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal de Backup */}
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
                      <p>Tamanho: {(backup.size / 1024).toFixed(2)} KB</p>
                    </IonLabel>
                    <IonButton fill="clear" onClick={() => handleImportBackup(backup.path)}>
                      Importar
                    </IonButton>
                    <IonButton fill="clear" color="danger" onClick={() => handleDeleteBackup(backup.path)}>
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </IonItem>
                ))
              )}
            </IonList>
          </IonContent>
        </IonModal>

        {/* Modal de Categorias */}
        <IonModal isOpen={showCategoryModal} onDidDismiss={() => setShowCategoryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Categorias Financeiras</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowCategoryModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {categories.map(cat => (
                <IonItem key={cat.id}>
                  <IonIcon 
                    icon={cat.icon || 'pricetag-outline'} 
                    slot="start" 
                    style={{ color: cat.color || '#4CAF50' }} 
                  />
                  <IonLabel>
                    <h3>{cat.name}</h3>
                    <p>{cat.type === 'income' ? 'Receita' : 'Despesa'}</p>
                  </IonLabel>
                  {!cat.is_default && (
                    <IonButton fill="clear" color="danger">
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  )}
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>

        {/* Alert de Confirmação */}
        <IonAlert
          isOpen={showDeleteConfirm}
          onDidDismiss={() => setShowDeleteConfirm(false)}
          header="Confirmar"
          message="Deseja realmente excluir este backup?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Excluir', handler: confirmDeleteBackup }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
