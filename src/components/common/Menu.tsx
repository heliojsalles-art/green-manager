import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonAvatar
} from '@ionic/react';
import {
  homeOutline,
  calendarOutline,
  cartOutline,
  walletOutline,
  settingsOutline,
  leafOutline
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

const Menu: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: homeOutline, label: 'Início' },
    { path: '/reminders', icon: calendarOutline, label: 'Lembretes' },
    { path: '/shopping', icon: cartOutline, label: 'Listas de Compras' },
    { path: '/finances', icon: walletOutline, label: 'Finanças' },
    { path: '/settings', icon: settingsOutline, label: 'Configurações' }
  ];

  return (
    <IonMenu contentId="main" side="start" type="overlay">
      <IonHeader>
        <IonToolbar color="primary" className="green-gradient">
          <IonTitle>GreenManager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <IonAvatar style={{ marginRight: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IonIcon icon={leafOutline} style={{ color: 'white', fontSize: '24px' }} />
            </div>
          </IonAvatar>
          <div>
            <h3 style={{ margin: 0, color: '#1B5E20' }}>GreenManager</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#4CAF50' }}>Sua vida organizada</p>
          </div>
        </div>

        <IonList>
          {menuItems.map((item) => (
            <IonMenuToggle key={item.path} autoHide={false}>
              <IonItem
                lines="none"
                detail={false}
                routerLink={item.path}
                routerDirection="root"
                className={location.pathname === item.path ? 'selected-menu-item' : ''}
                style={{
                  '--border-radius': '8px',
                  '--background': location.pathname === item.path ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  marginBottom: '4px'
                }}
              >
                <IonIcon
                  icon={item.icon}
                  slot="start"
                  style={{
                    color: location.pathname === item.path ? '#4CAF50' : '#666'
                  }}
                />
                <IonLabel style={{
                  color: location.pathname === item.path ? '#4CAF50' : '#666',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}>
                  {item.label}
                </IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '15px',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#4CAF50' }}>
            Versão 1.0.0
          </p>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
