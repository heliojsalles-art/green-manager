import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useState, useEffect } from 'react';
// REMOVIDO: walletOutline não utilizado

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  category_name: string; // ADICIONADO
  createdAt: Date; // ADICIONADO
  date: string;
}

const Finances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Carregar transações
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Finanças</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Conteúdo da página de finanças */}
      </IonContent>
    </IonPage>
  );
};

export default Finances;
