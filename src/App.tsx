import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

// Importar páginas
import Home from '@pages/Home';
import Reminders from '@pages/Reminders';
import ShoppingLists from '@pages/ShoppingLists';
import Finances from '@pages/Finances';
import Settings from '@pages/Settings';

// Importar componentes
import Menu from '@components/common/Menu';

// Importar serviços
import { DatabaseService } from '@services/database';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      const db = DatabaseService.getInstance();
      await db.initDB();
      
      // Configurar limpeza automática (24h)
      setInterval(() => {
        db.cleanupCompletedItems();
      }, 60 * 60 * 1000); // A cada hora
    };
    
    initApp();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route exact path="/" component={Home} />
            <Route exact path="/reminders" component={Reminders} />
            <Route exact path="/shopping" component={ShoppingLists} />
            <Route exact path="/finances" component={Finances} />
            <Route exact path="/settings" component={Settings} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
