import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total de Usuários</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', margin: 0 }}>150</p>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Projetos Ativos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3', margin: 0 }}>23</p>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Tarefas Concluídas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800', margin: 0 }}>89%</p>
        </div>
      </div>

      {/* Menu de navegação rápida */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Navegação Rápida</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link to="/profile" style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>Ver Perfil</Link>
          
          <Link to="/settings" style={{
            padding: '10px 20px',
            backgroundColor: '#757575',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>Configurações</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
