import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useState } from 'react';

interface Reminder {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // MUDADO de Date para string
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const handleComplete = (id: string) => {
    setReminders(prev => 
      prev.map(r => {
        if (r.id === id) {
          return { ...r, completed: !r.completed };
        }
        return r;
      })
    );
  };

  // CORRIGIDO: Comparação de tipos
  const activeReminders = reminders.filter(r => r.completed === false); // boolean com boolean
  const completedReminders = reminders.filter(r => r.completed === true);

  // CORRIGIDO: Date para string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lembretes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Conteúdo da página de lembretes */}
      </IonContent>
    </IonPage>
  );
};

export default Reminders;
