// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout'; // Layout com sidebar
import api from '../services/api';
import './Users.css';

function Users() {
  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulário (para criar/editar)
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState(''); // só para criação ou troca de senha

  // Mensagens de erro ou sucesso
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1) Carregar a lista de usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  // 2) Abrir formulário para CRIAR usuário
  const handleNewUser = () => {
    // Limpa campos do form
    setEditUserId(null);
    setName('');
    setEmail('');
    setRole('user');
    setPassword('');
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 3) Abrir formulário para EDITAR usuário
  const handleEdit = (user) => {
    setEditUserId(user._id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(''); // se quiser permitir redefinir
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 4) Salvar usuário (criar ou editar)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      // Se editUserId existe, EDITAR
      if (editUserId) {
        await api.put(`/users/${editUserId}`, {
          name,
          email,
          role,
          password // se quiser trocar a senha
        });
        setSuccessMsg('Usuário atualizado com sucesso!');
      } else {
        // CRIAR
        await api.post('/users/register', {
          name,
          email,
          role,
          password
          
        });
        setSuccessMsg('Usuário criado com sucesso!');
      }

      // Recarregar lista e fechar form
      fetchUsers();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao salvar usuário. Verifique se o email já existe.');
    }
  };

  // 5) Excluir usuário
  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccessMsg('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao excluir usuário.');
    }
  };

  return (
    <Layout>
      <div className="users-container">
        <h2>Gerenciar Usuários</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* Botão de novo usuário */}
        {!showForm && (
          <button className="btn-primary" onClick={handleNewUser}>
            Novo Usuário
          </button>
        )}

        {/* Lista de usuários */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleEdit(u)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDelete(u._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Formulário para criar/editar */}
        {showForm && (
          <div className="user-form">
            <h3>{editUserId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="engenheiro">Engenheiro</option> 
                </select>
              </div>
              {!editUserId && (
                <div className="form-group">
                  <label>Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {editUserId && (
                <div className="form-group">
                  <label>Nova Senha (opcional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="form-buttons">
                <button className="btn-primary" type="submit">
                  Salvar
                </button>
                <button 
                  className="btn-secondary" 
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;
