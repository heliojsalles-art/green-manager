import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

// Importar páginas
import Home from './pages/Home';
import Reminders from './pages/Reminders';
import ShoppingLists from './pages/ShoppingLists';
import Finances from './pages/Finances';
import Settings from './pages/Settings';

// Importar componentes
import Menu from './components/common/Menu';

// Importar serviços
import { DatabaseService } from './services/database';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './App.css';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        const db = DatabaseService.getInstance();
        await db.initDB();
        
        // Configurar limpeza automática (24h)
        setInterval(() => {
          db.cleanupCompletedItems();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      }
    };
    
    initApp();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/" exact={true} component={Home} />
            <Route path="/reminders" exact={true} component={Reminders} />
            <Route path="/shopping" exact={true} component={ShoppingLists} />
            <Route path="/finances" exact={true} component={Finances} />
            <Route path="/settings" exact={true} component={Settings} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
