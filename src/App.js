// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';

// Exemplo de rota protegida (opcional):
import PrivateRoute from './components/PrivateRoute';
import Users from './pages/Users';
import Fornecedores from './pages/Suppliers';
import Items from './pages/Items';
import Pedidos from './pages/Pedido';
import Obras from './pages/Obras';
import Engenheiros from './pages/Engenheiros';
import Solicitacoes from './pages/Solicitacoes';
import SolicitacoesAdmin from './pages/SolicitacoesAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Para proteger a rota /welcome, use um wrapper PrivateRoute */}
        <Route
          path="/welcome"
          element={
            <PrivateRoute>
              <Welcome />
            </PrivateRoute>
          }
        />

          <Route 
          path="/usuarios"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />

        <Route 
          path="/fornecedores"
          element={
            <PrivateRoute>
              <Fornecedores />
            </PrivateRoute>
          }
        />

        <Route 
          path="/itens"
          element={
            <PrivateRoute>
              <Items />
            </PrivateRoute>
          }
        />

        <Route 
          path="/pedidos"
          element={
            <PrivateRoute>
              <Pedidos />
            </PrivateRoute>
          }
        />

        <Route 
          path="/obras"
          element={
            <PrivateRoute>
              <Obras />
            </PrivateRoute>
          }
        />  

        <Route 
          path="/engenheiros"
          element={
            <PrivateRoute>
              <Engenheiros />
            </PrivateRoute>
          }
        />  

        <Route 
          path="/solicitacoes"
          element={
            <PrivateRoute>
              <Solicitacoes />
            </PrivateRoute>
          }
        />

        <Route
          path="/solicitacoesAdmin"
          element={
            <PrivateRoute>
              <SolicitacoesAdmin />
            </PrivateRoute>
          }
          />

        {/* Rota padrão ou not found */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
