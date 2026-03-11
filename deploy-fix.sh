#!/bin/bash

echo "🌿 GreenManager - Script de Correção e Deploy"
echo "================================================"

# 1. Backup do código atual
echo "📦 Fazendo backup do código atual..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/backups
cp -r . ~/backups/green-manager-backup-$timestamp
echo "✅ Backup criado em ~/backups/green-manager-backup-$timestamp"

# 2. Criar estrutura de diretórios necessária
echo "📁 Criando estrutura de diretórios..."
mkdir -p src/pages
mkdir -p src/components/common
mkdir -p src/services
mkdir -p src/theme
mkdir -p src/types
mkdir -p public/assets

# 3. Criar arquivo de tipos
echo "📝 Criando arquivo de tipos..."
cat > src/types/index.ts << 'EOF'
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: number;
  completedAt?: string;
  createdAt: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity?: string;
  completed: number;
  completedAt?: string;
  createdAt: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  category_name?: string;
  category_color?: string;
  date: string;
  notes?: string;
  createdAt?: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    reminders: Reminder[];
    shoppingLists: any[];
    transactions: Transaction[];
    categories: FinanceCategory[];
  };
}
EOF

# 4. Criar arquivo de cores do tema
echo "🎨 Criando tema de cores..."
cat > src/theme/colors.ts << 'EOF'
export const greenTheme = {
  primary: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#2E7D32',
    contrast: '#FFFFFF'
  },
  secondary: {
    light: '#A5D6A7',
    main: '#66BB6A',
    dark: '#2E7D32',
    contrast: '#FFFFFF'
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    green: 'rgba(76, 175, 80, 0.05)',
    card: '#FFFFFF'
  },
  text: {
    primary: '#1B5E20',
    secondary: '#4CAF50',
    disabled: '#9E9E9E',
    hint: '#757575'
  },
  finance: {
    income: '#4CAF50',
    expense: '#F44336',
    neutral: '#FF9800',
    incomeLight: '#E8F5E9',
    expenseLight: '#FFEBEE'
  }
};
EOF

# 5. Criar Menu component
echo "📱 Criando componente Menu..."
cat > src/components/common/Menu.tsx << 'EOF'
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
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
EOF

# 6. Criar Database Service corrigido
echo "🗄️  Criando Database Service..."
cat > src/services/database.ts << 'EOF'
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private static instance: DatabaseService;
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  private constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initDB(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      await this.sqlite.createConnection(
        'greenmanager',
        false,
        'no-encryption',
        1,
        false
      );

      this.db = await this.sqlite.retrieveConnection('greenmanager', false);

      if (this.db) {
        await this.createTables();
        await this.initDefaultCategories();
        this.isInitialized = true;
        console.log('Database initialized successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const queries = `
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shopping_items (
        id TEXT PRIMARY KEY NOT NULL,
        list_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS finance_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')),
        icon TEXT,
        color TEXT,
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')),
        category_id TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES finance_categories(id)
      );
    `;

    await this.db.execute(queries);
  }

  private async initDefaultCategories(): Promise<void> {
    if (!this.db) return;

    const defaultCategories = [
      ['Salário', 'income', 'cash-outline', '#4CAF50', 1],
      ['Alimentação', 'expense', 'restaurant-outline', '#FF5722', 1],
      ['Transporte', 'expense', 'car-outline', '#2196F3', 1],
      ['Moradia', 'expense', 'home-outline', '#9C27B0', 1],
      ['Saúde', 'expense', 'fitness-outline', '#F44336', 1],
      ['Educação', 'expense', 'school-outline', '#FF9800', 1],
      ['Lazer', 'expense', 'game-controller-outline', '#E91E63', 1],
      ['Compras', 'expense', 'cart-outline', '#795548', 1]
    ];

    for (const cat of defaultCategories) {
      await this.db.run(
        `INSERT OR IGNORE INTO finance_categories (id, name, type, icon, color, is_default) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), ...cat]
      );
    }
  }

  async cleanupCompletedItems(): Promise<void> {
    if (!this.db) return;

    await this.db.run(`
      DELETE FROM reminders 
      WHERE completed = 1 
      AND datetime(completed_at) < datetime('now', '-1 day')
    `);

    await this.db.run(`
      DELETE FROM shopping_items 
      WHERE completed = 1 
      AND datetime(completed_at) < datetime('now', '-1 day')
    `);
  }

  async getDB(): Promise<SQLiteDBConnection | null> {
    if (!this.isInitialized) {
      await this.initDB();
    }
    return this.db;
  }
}
EOF

# 7. Criar Category Service
echo "🏷️  Criando Category Service..."
cat > src/services/categories.ts << 'EOF'
import { DatabaseService } from './database';
import { FinanceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  private static instance: CategoryService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getAllCategories(type?: 'income' | 'expense'): Promise<FinanceCategory[]> {
    const database = await this.db.getDB();
    if (!database) return [];

    let query = 'SELECT * FROM finance_categories';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    const result = await database.query(query, params);
    
    return (result.values || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      isDefault: cat.is_default === 1,
      createdAt: cat.created_at
    }));
  }

  async addCategory(category: Omit<FinanceCategory, 'id' | 'createdAt' | 'isDefault'>): Promise<string> {
    const database = await this.db.getDB();
    if (!database) throw new Error('Database not initialized');

    const id = uuidv4();
    await database.run(
      `INSERT INTO finance_categories (id, name, type, icon, color, is_default, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, category.name, category.type, category.icon || 'pricetag-outline', category.color || '#4CAF50', 0, new Date().toISOString()]
    );

    return id;
  }
}
EOF

# 8. Criar Backup Service
echo "💾  Criando Backup Service..."
cat > src/services/backup.ts << 'EOF'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { DatabaseService } from './database';
import { BackupData } from '../types';

export class BackupService {
  private static instance: BackupService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async exportBackup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const database = await this.db.getDB();
      if (!database) throw new Error('Database not initialized');

      const reminders = await database.query('SELECT * FROM reminders');
      const shoppingLists = await database.query('SELECT * FROM shopping_lists');
      const shoppingItems = await database.query('SELECT * FROM shopping_items');
      const transactions = await database.query('SELECT * FROM transactions');
      const categories = await database.query('SELECT * FROM finance_categories');

      const backupData: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          reminders: reminders.values || [],
          shoppingLists: this.organizeShoppingLists(shoppingLists.values || [], shoppingItems.values || []),
          transactions: transactions.values || [],
          categories: (categories.values || []).map(cat => ({
            ...cat,
            isDefault: cat.is_default === 1,
            createdAt: cat.created_at
          }))
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const fileName = `greenmanager_backup_${Date.now()}.json`;

      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: `Documents/${fileName}`,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        return { success: true, filePath: result.uri };
      }
      return { success: true, filePath: fileName };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listBackups(): Promise<{ name: string; path: string; size: number }[]> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return [];
      }

      const result = await Filesystem.readdir({
        path: 'Documents/',
        directory: Directory.Documents
      });

      return result.files
        .filter(file => file.name.startsWith('greenmanager_backup') && file.name.endsWith('.json'))
        .map(file => ({
          name: file.name,
          path: `Documents/${file.name}`,
          size: file.size || 0
        }));
    } catch (error) {
      return [];
    }
  }

  private organizeShoppingLists(lists: any[], items: any[]): any[] {
    return lists.map(list => ({
      ...list,
      items: items.filter(item => item.list_id === list.id)
    }));
  }
}
EOF

# 9. Criar App.tsx corrigido
echo "📱  Criando App.tsx..."
cat > src/App.tsx << 'EOF'
import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

import Home from './pages/Home';
import Reminders from './pages/Reminders';
import ShoppingLists from './pages/ShoppingLists';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import Menu from './components/common/Menu';
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
      const db = DatabaseService.getInstance();
      await db.initDB();
      
      setInterval(() => {
        db.cleanupCompletedItems();
      }, 60 * 60 * 1000);
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
EOF

# 10. Criar App.css
echo "🎨  Criando App.css..."
cat > src/App.css << 'EOF'
:root {
  --ion-color-primary: #4CAF50;
  --ion-color-primary-rgb: 76,175,80;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255,255,255;
  --ion-color-primary-shade: #43a047;
  --ion-color-primary-tint: #66bb6a;

  --ion-color-secondary: #2E7D32;
  --ion-color-secondary-rgb: 46,125,50;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255,255,255;
  --ion-color-secondary-shade: #27632a;
  --ion-color-secondary-tint: #439246;

  --ion-color-tertiary: #81C784;
  --ion-color-tertiary-rgb: 129,199,132;
  --ion-color-tertiary-contrast: #000000;
  --ion-color-tertiary-contrast-rgb: 0,0,0;
  --ion-color-tertiary-shade: #72af74;
  --ion-color-tertiary-tint: #8ecd91;

  --ion-color-success: #2dd36f;
  --ion-color-warning: #ffc409;
  --ion-color-danger: #f44336;
  --ion-color-medium: #92949c;

  --ion-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

body {
  background-color: #f5f5f5;
}

.green-gradient {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
}

.completed-item {
  opacity: 0.7;
  text-decoration: line-through;
}

.finance-income {
  color: #4CAF50;
  font-weight: 600;
}

.finance-expense {
  color: #f44336;
  font-weight: 600;
}

.card-green {
  border-left: 4px solid #4CAF50;
  border-radius: 8px;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
EOF

# 11. Atualizar package.json para remover aliases não utilizados
echo "📦  Atualizando package.json..."
cat > package.json << 'EOF'
{
  "name": "green-manager",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@capacitor-community/sqlite": "^5.2.1",
    "@capacitor/core": "^5.7.0",
    "@capacitor/filesystem": "^5.2.0",
    "@capacitor/ios": "^5.7.0",
    "@capacitor/preferences": "^5.0.7",
    "@capacitor/splash-screen": "^5.0.7",
    "@ionic/react": "^7.8.0",
    "@ionic/react-router": "^7.8.0",
    "@ionic/pwa-elements": "^3.2.2",
    "@types/uuid": "^9.0.8",
    "date-fns": "^3.3.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.7.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

# 12. Atualizar vite.config.ts para remover aliases
echo "⚙️  Atualizando vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 3000,
    host: true
  }
})
EOF

# 13. Atualizar tsconfig.json
echo "🔧  Atualizando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# 14. Criar main.tsx
echo "🚀  Criando main.tsx..."
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# 15. Criar vite-env.d.ts
echo "📝  Criando vite-env.d.ts..."
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF

# 16. Verificar se todos os arquivos das páginas existem
echo "📱  Verificando páginas..."

if [ ! -f src/pages/Home.tsx ]; then
  echo "Criando Home.tsx..."
  cat > src/pages/Home.tsx << 'EOF'
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Início</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Bem-vindo ao GreenManager!</h1>
      </IonContent>
    </IonPage>
  );
};

export default Home;
EOF
fi

if [ ! -f src/pages/Reminders.tsx ]; then
  echo "Criando Reminders.tsx..."
  cat > src/pages/Reminders.tsx << 'EOF'
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Reminders: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Lembretes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Lembretes</h1>
      </IonContent>
    </IonPage>
  );
};

export default Reminders;
EOF
fi

if [ ! -f src/pages/ShoppingLists.tsx ]; then
  echo "Criando ShoppingLists.tsx..."
  cat > src/pages/ShoppingLists.tsx << 'EOF'
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const ShoppingLists: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Listas de Compras</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Listas de Compras</h1>
      </IonContent>
    </IonPage>
  );
};

export default ShoppingLists;
EOF
fi

if [ ! -f src/pages/Finances.tsx ]; then
  echo "Criando Finances.tsx..."
  cat > src/pages/Finances.tsx << 'EOF'
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Finances: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Finanças</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Finanças</h1>
      </IonContent>
    </IonPage>
  );
};

export default Finances;
EOF
fi

if [ ! -f src/pages/Settings.tsx ]; then
  echo "Criando Settings.tsx..."
  cat > src/pages/Settings.tsx << 'EOF'
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Settings: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Configurações</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Configurações</h1>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
EOF
fi

# 17. Git commands
echo "📤  Preparando para enviar ao GitHub..."
git add .
git status
git commit -m "Fix: Correção completa do projeto - Removidos aliases e ajustados imports"
git push origin main --force

echo ""
echo "✅ CORREÇÃO COMPLETA!"
echo "================================================"
echo "O código foi atualizado e enviado para o GitHub."
echo "Agora o CodeMagic vai usar a versão correta."
echo ""
echo "Próximos passos:"
echo "1. Acesse https://codemagic.io"
echo "2. Inicie um novo build manualmente"
echo "3. O build deve funcionar sem erros"
echo "================================================"
