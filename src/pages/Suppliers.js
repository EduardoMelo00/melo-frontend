// src/pages/Suppliers.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import './Suppliers.css';

function Suppliers() {
  // Estados
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);

  // Campos do formulário
  const [supplierData, setSupplierData] = useState({
    fornecedor: '',
    nomeFantasia: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    cnpj: '',
    inscEstadual: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Carregar fornecedores ao montar o componente
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fornecedores');
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao carregar fornecedores.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Abrir formulário para criar um novo fornecedor
  const handleNewSupplier = () => {
    setEditSupplierId(null);
    setSupplierData({
      fornecedor: '',
      nomeFantasia: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      cnpj: '',
      inscEstadual: '',
    });
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 3. Abrir formulário para editar um fornecedor existente
  const handleEdit = (supplier) => {
    setEditSupplierId(supplier._id);
    setSupplierData(supplier);
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 4. Salvar fornecedor (criar ou editar)
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editSupplierId) {
        // Editar fornecedor
        await api.put(`/fornecedores/${editSupplierId}`, supplierData);
        setSuccessMsg('Fornecedor atualizado com sucesso!');
      } else {
        // Criar fornecedor
        await api.post('/fornecedores', supplierData);
        setSuccessMsg('Fornecedor criado com sucesso!');
      }
      fetchSuppliers();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao salvar fornecedor. Verifique os dados fornecidos.');
    }
  };

  // 5. Excluir fornecedor
  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este fornecedor?')) return;
    try {
      await api.delete(`/fornecedores/${id}`);
      setSuccessMsg('Fornecedor deletado com sucesso!');
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao excluir fornecedor.');
    }
  };

  // Atualizar os campos do formulário
  const handleInputChange = (e) => {
    setSupplierData({ ...supplierData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="suppliers-container">
        <h2>Gerenciar Fornecedores</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* Botão de novo fornecedor */}
        {!showForm && (
          <button className="btn-primary" onClick={handleNewSupplier}>
            Novo Fornecedor
          </button>
        )}

        {/* Lista de fornecedores */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Nome Fantasia</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td>{supplier.fornecedor}</td>
                  <td>{supplier.nomeFantasia}</td>
                  <td>{supplier.cnpj}</td>
                  <td>{supplier.telefone}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(supplier)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(supplier._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Formulário de fornecedor */}
        {showForm && (
          <div className="supplier-form">
            <h3>{editSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
            <form onSubmit={handleSaveSupplier}>
              <div className="form-group">
                <label>Fornecedor (Razão Social)</label>
                <input
                  type="text"
                  name="fornecedor"
                  value={supplierData.fornecedor}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome Fantasia</label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={supplierData.nomeFantasia}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={supplierData.cnpj}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={supplierData.telefone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={supplierData.endereco}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={supplierData.cidade}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  name="estado"
                  value={supplierData.estado}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={supplierData.cep}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Inscrição Estadual</label>
                <input
                  type="text"
                  name="inscEstadual"
                  value={supplierData.inscEstadual}
                  onChange={handleInputChange}
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

export default Suppliers;
