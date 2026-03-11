import React from 'react';
import { Link } from 'react-router-dom';

const Menu: React.FC = () => {
  return (
    <nav style={{ padding: '15px', backgroundColor: '#f5f5f5' }}>
      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/profile">Perfil</Link></li>
        <li><Link to="/settings">Configurações</Link></li>
      </ul>
    </nav>
  );
};

export default Menu;
