import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { useState } from 'react';

interface ShoppingItem {
  id: string;
  name: string;
  purchased: boolean;
  quantity: number;
}

const ShoppingLists: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // CORRIGIDO: Comparação de tipos
  const pendingItems = items.filter(item => item.purchased === false);
  const purchasedItems = items.filter(item => item.purchased === true);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Listas de Compras</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Conteúdo da página de listas */}
      </IonContent>
    </IonPage>
  );
};

export default ShoppingLists;
