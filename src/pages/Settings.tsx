import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'pt-BR'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Usar DatabaseService.getInstance() corretamente
      const dbService = DatabaseService.getInstance();
      await dbService.connect();
      console.log('Configurações carregadas');
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Usar DatabaseService.getInstance() corretamente
      const dbService = DatabaseService.getInstance();
      await dbService.query('UPDATE settings SET ?', [settings]);
      console.log('Configurações salvas');
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setSettings({ ...settings, theme: newTheme });
  };

  const handleNotificationChange = () => {
    setSettings({ ...settings, notifications: !settings.notifications });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSettings({ ...settings, language: newLanguage });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Configurações</h1>
      
      {/* Tema */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Tema</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '10px 20px',
              backgroundColor: settings.theme === 'light' ? '#4CAF50' : '#e0e0e0',
              color: settings.theme === 'light' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Claro
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '10px 20px',
              backgroundColor: settings.theme === 'dark' ? '#4CAF50' : '#e0e0e0',
              color: settings.theme === 'dark' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Escuro
          </button>
        </div>
      </div>

      {/* Notificações */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Notificações</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={handleNotificationChange}
          />
          <span>Receber notificações</span>
        </label>
      </div>

      {/* Idioma */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Idioma</h2>
        <select
          value={settings.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Salvar Configurações
      </button>
    </div>
  );
};

export default Settings;
