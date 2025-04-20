import React from 'react';
import './Welcome.css';
import Layout from '../components/Layout';

function Welcome() {
  const userName = localStorage.getItem('userName') || 'Usuário';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <Layout>
    <div className="welcome-page">
   
      <h1>Bem-vindo, {userName}!</h1>
      <p>Essa é a tela inicial do sistema.</p>
      <p>Use o menu lateral para navegar.</p>
    </div>
    </Layout>
  );
}

export default Welcome;
