// src/pages/Items.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import './Items.css';

function Items() {
  // Estados
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // Campos do formulário
  const [itemData, setItemData] = useState({
    discriminacao: '',
    unidade: '',
    precoUnitario: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Carregar itens ao montar o componente
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/items');
      setItems(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao carregar itens.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Abrir formulário para criar um novo item
  const handleNewItem = () => {
    setEditItemId(null);
    setItemData({
      discriminacao: '',
      unidade: '',
      precoUnitario: '',
    });
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 3. Abrir formulário para editar um item existente
  const handleEdit = (item) => {
    setEditItemId(item._id);
    setItemData(item);
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 4. Salvar item (criar ou editar)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        // Editar item
        await api.put(`/items/${editItemId}`, itemData);
        setSuccessMsg('Item atualizado com sucesso!');
      } else {
        // Criar item
        await api.post('/items', itemData);
        setSuccessMsg('Item criado com sucesso!');
      }
      fetchItems();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao salvar item. Verifique os dados fornecidos.');
    }
  };

  // 5. Excluir item
  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setSuccessMsg('Item deletado com sucesso!');
      fetchItems();
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao excluir item.');
    }
  };

  // Atualizar os campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  return (
    <Layout>
      <div className="items-container">
        <h2>Gerenciar Itens</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* Botão de novo item */}
        {!showForm && (
          <button className="btn-primary" onClick={handleNewItem}>
            Novo Item
          </button>
        )}

        {/* Lista de itens */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Discriminação</th>
                <th>Unidade</th>
                <th>Preço Unitário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.discriminacao}</td>
                  <td>{item.unidade}</td>
                  <td>R$ {item.precoUnitario.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Formulário de item */}
        {showForm && (
          <div className="item-form">
            <h3>{editItemId ? 'Editar Item' : 'Novo Item'}</h3>
            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label>Discriminação</label>
                <input
                  type="text"
                  name="discriminacao"
                  value={itemData.discriminacao}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unidade</label>
                <input
                  type="text"
                  name="unidade"
                  value={itemData.unidade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preço Unitário</label>
                <input
                  type="number"
                  step="0.01"
                  name="precoUnitario"
                  value={itemData.precoUnitario}
                  onChange={handleInputChange}
                  required
                />
              </div>
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

export default Items;
