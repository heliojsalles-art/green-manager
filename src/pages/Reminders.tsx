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
  IonCheckbox,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonToast,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { addOutline, trashOutline, alertCircleOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database';
import { Reminder } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Partial<Reminder>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const db = DatabaseService.getInstance();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const database = await db.getDB();
    if (!database) return;

    const result = await database.query(
      'SELECT * FROM reminders ORDER BY due_date ASC, created_at DESC'
    );
    
    setReminders(result.values || []);
  };

  const handleSave = async () => {
    if (!editingReminder.title) {
      setToastMessage('Título é obrigatório');
      setShowToast(true);
      return;
    }

    const database = await db.getDB();
    if (!database) return;

    if (editingReminder.id) {
      // Atualizar
      await database.run(
        `UPDATE reminders 
         SET title = ?, description = ?, due_date = ?
         WHERE id = ?`,
        [editingReminder.title, editingReminder.description, editingReminder.dueDate, editingReminder.id]
      );
    } else {
      // Criar novo
      const id = uuidv4();
      await database.run(
        `INSERT INTO reminders (id, title, description, due_date, completed, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, editingReminder.title, editingReminder.description, editingReminder.dueDate, 0, new Date().toISOString()]
      );
    }

    setShowModal(false);
    setEditingReminder({});
    loadReminders();
  };

  const toggleReminder = async (reminder: Reminder) => {
    const database = await db.getDB();
    if (!database) return;

    const newStatus = reminder.completed ? 0 : 1;
    const completedAt = newStatus ? new Date().toISOString() : null;

    await database.run(
      'UPDATE reminders SET completed = ?, completed_at = ? WHERE id = ?',
      [newStatus, completedAt, reminder.id]
    );

    loadReminders();
  };

  const deleteReminder = async (id: string) => {
    const database = await db.getDB();
    if (!database) return;

    await database.run('DELETE FROM reminders WHERE id = ?', [id]);
    loadReminders();
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadReminders();
    event.detail.complete();
  };

  const getDueDateText = (dueDate?: string) => {
    if (!dueDate) return 'Sem data';
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>Lembretes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {reminders.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#ccc' }} />
            <p>Nenhum lembrete cadastrado</p>
          </div>
        ) : (
          <IonList>
            {reminders.map(reminder => (
              <IonItem
                key={reminder.id}
                className={reminder.completed ? 'completed-item' : ''}
              >
                <IonCheckbox
                  slot="start"
                  checked={reminder.completed === 1}
                  onIonChange={() => toggleReminder(reminder)}
                />
                <IonLabel>
                  <h3>{reminder.title}</h3>
                  {reminder.description && <p>{reminder.description}</p>}
                  {reminder.dueDate && (
                    <p style={{ fontSize: '12px', color: '#4CAF50' }}>
                      {getDueDateText(reminder.dueDate)}
                    </p>
                  )}
                </IonLabel>
                <IonButton
                  fill="clear"
                  color="danger"
                  slot="end"
                  onClick={() => deleteReminder(reminder.id)}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => {
            setEditingReminder({});
            setShowModal(true);
          }}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingReminder.id ? 'Editar' : 'Novo'} Lembrete</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Título"
              labelPlacement="stacked"
              placeholder="Digite o título"
              value={editingReminder.title}
              onIonChange={e => setEditingReminder({ ...editingReminder, title: e.detail.value! })}
            />
            <IonTextarea
              label="Descrição"
              labelPlacement="stacked"
              placeholder="Digite a descrição"
              value={editingReminder.description}
              onIonChange={e => setEditingReminder({ ...editingReminder, description: e.detail.value! })}
            />
            <IonDatetime
              label="Data"
              presentation="date"
              value={editingReminder.dueDate}
              onIonChange={e => setEditingReminder({ ...editingReminder, dueDate: e.detail.value as string })}
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

export default Reminders;
