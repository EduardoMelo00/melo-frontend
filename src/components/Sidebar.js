// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const role = localStorage.getItem('role'); // 'admin' ou 'user'
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Melo Engenharia" />
      </div>

      <nav className="sidebar-nav">
        {/* Link comum a todos */}
        <Link to="/welcome" className="sidebar-link">
          Início
        </Link>

        {/* Se admin, mostra cadastros */}
        {role === 'admin' && (
          <>
            <Link to="/usuarios" className="sidebar-link">
              Usuários
            </Link>
            <Link to="/fornecedores" className="sidebar-link">
              Fornecedores
            </Link>
            <Link to="/itens" className="sidebar-link">
              Itens
            </Link>
            <Link to="/solicitacoesAdmin" className="sidebar-link">
              Solicitacoes Admin
            </Link>
            
          </>
        )}

        {/* Link comum a todos, se quiser */}
        <Link to="/pedidos" className="sidebar-link">
          Pedidos
        </Link>
        <Link to="/obras" className="sidebar-link">
          Obras
        </Link>
        <Link to="/engenheiros" className="sidebar-link">
          Engenheiros
        </Link>

          {role == "engenheiro"  && (
          <>
            <Link to="/solicitacoes" className="sidebar-link">
              Solicitações
            </Link>
          </>
        )}
        
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
