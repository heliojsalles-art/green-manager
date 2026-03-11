import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Finances from './pages/Finances';
import Reminders from './pages/Reminders';
import ShoppingLists from './pages/ShoppingLists';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* REMOVA O 'exact' DE TODAS AS ROTAS */}
          <Route path="/" component={Home} />
          <Route path="/finances" component={Finances} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/shopping-lists" component={ShoppingLists} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
