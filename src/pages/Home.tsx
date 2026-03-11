import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useEffect, useState } from 'react';
// CORRIGIDO: Caminho do import do database
import { getDatabase } from '../services/database'; // Assumindo que está em src/services/

const Home: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase();
      // ... lógica para carregar dados
    };
    loadData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Green Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Bem-vindo ao Green Manager</h1>
        {/* Conteúdo da página */}
      </IonContent>
    </IonPage>
  );
};

export default Home;
