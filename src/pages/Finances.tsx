import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useState } from 'react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  category_name?: string;
  createdAt?: Date;
  date: string;
}

const Finances: React.FC = () => {
  const [transactions] = useState<Transaction[]>([]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Finanças</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Finanças</h2>
        {/* Seu conteúdo aqui */}
      </IonContent>
    </IonPage>
  );
};

export default Finances;
