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
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';
import { addOutline, trashOutline, cartOutline, listOutline } from 'ionicons/icons';
import { DatabaseService } from '../services/database';
import { ShoppingList, ShoppingItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ShoppingLists: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentList, setCurrentList] = useState<Partial<ShoppingList>>({});
  const [currentItem, setCurrentItem] = useState<Partial<ShoppingItem>>({});
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const db = DatabaseService.getInstance();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const database = await db.getDB();
    if (!database) return;

    const listsResult = await database.query('SELECT * FROM shopping_lists ORDER BY created_at DESC');
    const itemsResult = await database.query('SELECT * FROM shopping_items');

    const listsWithItems = (listsResult.values || []).map(list => ({
      ...list,
      items: (itemsResult.values || []).filter(item => item.list_id === list.id)
    }));

    setLists(listsWithItems);
  };

  const saveList = async () => {
    if (!currentList.name) {
      setToastMessage('Nome da lista é obrigatório');
      setShowToast(true);
      return;
    }

    const database = await db.getDB();
    if (!database) return;

    if (currentList.id) {
      await database.run(
        'UPDATE shopping_lists SET name = ? WHERE id = ?',
        [currentList.name, currentList.id]
      );
    } else {
      const id = uuidv4();
      await database.run(
        'INSERT INTO shopping_lists (id, name, created_at) VALUES (?, ?, ?)',
        [id, currentList.name, new Date().toISOString()]
      );
    }

    setShowListModal(false);
    setCurrentList({});
    loadLists();
  };

  const saveItem = async () => {
    if (!currentItem.name || !selectedList) {
      setToastMessage('Nome do item é obrigatório');
      setShowToast(true);
      return;
    }

    const database = await db.getDB();
    if (!database) return;

    const id = uuidv4();
    await database.run(
      `INSERT INTO shopping_items (id, list_id, name, quantity, completed, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, selectedList, currentItem.name, currentItem.quantity, 0, new Date().toISOString()]
    );

    setShowItemModal(false);
    setCurrentItem({});
    loadLists();
  };

  const toggleItem = async (item: ShoppingItem) => {
    const database = await db.getDB();
    if (!database) return;

    const newStatus = item.completed ? 0 : 1;
    const completedAt = newStatus ? new Date().toISOString() : null;

    await database.run(
      'UPDATE shopping_items SET completed = ?, completed_at = ? WHERE id = ?',
      [newStatus, completedAt, item.id]
    );

    loadLists();
  };

  const deleteList = async (id: string) => {
    const database = await db.getDB();
    if (!database) return;

    await database.run('DELETE FROM shopping_lists WHERE id = ?', [id]);
    loadLists();
  };

  const deleteItem = async (id: string) => {
    const database = await db.getDB();
    if (!database) return;

    await database.run('DELETE FROM shopping_items WHERE id = ?', [id]);
    loadLists();
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadLists();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>Listas de Compras</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {lists.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonIcon icon={cartOutline} style={{ fontSize: '48px', color: '#ccc' }} />
            <p>Nenhuma lista criada</p>
          </div>
        ) : (
          lists.map(list => (
            <IonCard key={list.id} className="ion-margin-bottom">
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {list.name}
                  <div>
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => {
                        setSelectedList(list.id);
                        setShowItemModal(true);
                      }}
                    >
                      <IonIcon icon={addOutline} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="danger"
                      onClick={() => deleteList(list.id)}
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {list.items && list.items.length > 0 ? (
                    list.items.map(item => (
                      <IonItem key={item.id} className={item.completed ? 'completed-item' : ''}>
                        <IonCheckbox
                          slot="start"
                          checked={item.completed === 1}
                          onIonChange={() => toggleItem(item)}
                        />
                        <IonLabel>
                          <h3>{item.name}</h3>
                          {item.quantity && <p>Quantidade: {item.quantity}</p>}
                        </IonLabel>
                        <IonButton
                          fill="clear"
                          color="danger"
                          slot="end"
                          onClick={() => deleteItem(item.id)}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </IonItem>
                    ))
                  ) : (
                    <IonItem>
                      <IonLabel className="ion-text-center">Nenhum item nesta lista</IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => {
            setCurrentList({});
            setShowListModal(true);
          }}>
            <IonIcon icon={listOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal de Lista */}
        <IonModal isOpen={showListModal} onDidDismiss={() => setShowListModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nova Lista</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowListModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Nome da Lista"
              labelPlacement="stacked"
              placeholder="Ex: Feira do mês"
              value={currentList.name}
              onIonChange={e => setCurrentList({ ...currentList, name: e.detail.value! })}
            />
            <IonButton expand="block" onClick={saveList} className="ion-margin-top">
              Salvar
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Modal de Item */}
        <IonModal isOpen={showItemModal} onDidDismiss={() => setShowItemModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Novo Item</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowItemModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Nome do Item"
              labelPlacement="stacked"
              placeholder="Ex: Arroz"
              value={currentItem.name}
              onIonChange={e => setCurrentItem({ ...currentItem, name: e.detail.value! })}
            />
            <IonInput
              label="Quantidade"
              labelPlacement="stacked"
              placeholder="Ex: 5kg"
              value={currentItem.quantity}
              onIonChange={e => setCurrentItem({ ...currentItem, quantity: e.detail.value! })}
            />
            <IonButton expand="block" onClick={saveItem} className="ion-margin-top">
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

export default ShoppingLists;
