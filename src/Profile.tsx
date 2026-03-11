import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.connect();
      
      // Dados simulados
      const userProfile: UserProfile = {
        id: '1',
        name: 'Usuário Teste',
        email: 'usuario@email.com',
        bio: 'Desenvolvedor full stack',
        createdAt: new Date()
      };
      
      setProfile(userProfile);
      setFormData({
        name: userProfile.name,
        bio: userProfile.bio || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.query('UPDATE profile SET ?', [formData]);
      
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar perfil');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '30px'
      }}>
        <h1 style={{ margin: '0 0 30px 0', color: '#333' }}>Meu Perfil</h1>
        
        {!editing ? (
          // MODO VISUALIZAÇÃO
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>
                Nome:
              </label>
              <p style={{ margin: 0, fontSize: '18px' }}>{profile.name}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>
                Email:
              </label>
              <p style={{ margin: 0 }}>{profile.email}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>
                Bio:
              </label>
              <p style={{ margin: 0 }}>{profile.bio || 'Nenhuma bio adicionada'}</p>
            </div>
            
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Editar Perfil
            </button>
          </>
        ) : (
          // MODO EDIÇÃO
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                Nome:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
                Bio:
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  minHeight: '100px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Salvar
              </button>
              
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
