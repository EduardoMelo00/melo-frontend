import React, { useEffect, useState } from "react";
import Layout from "../components/Layout"; // Layout com sidebar
import api from "../services/api";
import Select from "react-select"; // Biblioteca react-select
import "./Engenheiros.css";

function Engenheiros() {
  // Estados
  const [engenheiros, setEngenheiros] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário (para criar/editar)
  const [showForm, setShowForm] = useState(false);
  const [editEngenheiroId, setEditEngenheiroId] = useState(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [engenheiroObras, setEngenheiroObras] = useState([]);

  // Mensagens de erro ou sucesso
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1) Carregar a lista de engenheiros e obras
  useEffect(() => {
    fetchEngenheiros();
    fetchObras();
  }, []);

  const fetchEngenheiros = async () => {
    try {
      setLoading(true);
      const res = await api.get("/engenheiros");
      setEngenheiros(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao carregar lista de engenheiros.");
    } finally {
      setLoading(false);
    }
  };

  const fetchObras = async () => {
    try {
      const res = await api.get("/obras");
      setObras(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao carregar obras.");
    }
  };

  // 2) Abrir formulário para CRIAR engenheiro
  const handleNewEngenheiro = () => {
    setEditEngenheiroId(null);
    setName("");
    setEmail("");
    setEngenheiroObras([]);
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 3) Abrir formulário para EDITAR engenheiro
  const handleEdit = (engenheiro) => {
    setEditEngenheiroId(engenheiro._id);
    setName(engenheiro.name);
    setEmail(engenheiro.email);
    // Formatar as obras como objetos do react-select
    const obrasSelecionadas = engenheiro.obras.map((obra) => ({
      value: obra._id,
      label: obra.name,
    }));
    setEngenheiroObras(obrasSelecionadas);
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 4) Salvar engenheiro (criar ou editar)
  const handleSaveEngenheiro = async (e) => {
    e.preventDefault();
    try {
      if (editEngenheiroId) {
        // Atualizar engenheiro
        await api.put(`/engenheiros/${editEngenheiroId}`, {
          name,
          email,
          obras: engenheiroObras.map((obra) => obra.value), // Enviar apenas os IDs
        });
        setSuccessMsg("Engenheiro atualizado com sucesso!");
      } else {
        // Criar novo engenheiro
        await api.post("/engenheiros", {
          name,
          email,
          obras: engenheiroObras.map((obra) => obra.value), // Enviar apenas os IDs
        });
        setSuccessMsg("Engenheiro criado com sucesso!");
      }

      // Recarregar lista e fechar formulário
      fetchEngenheiros();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao salvar engenheiro.");
    }
  };

  // 5) Excluir engenheiro
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir este engenheiro?")) return;
    try {
      await api.delete(`/engenheiros/${id}`);
      setSuccessMsg("Engenheiro excluído com sucesso!");
      fetchEngenheiros();
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao excluir engenheiro.");
    }
  };

  // 6) Preparar opções de obras para o Select
  const obraOptions = obras.map((obra) => ({
    value: obra._id,
    label: obra.name,
  }));

  return (
    <Layout>
      <div className="engenheiros-container">
        <h2>Gerenciar Engenheiros</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {!showForm && (
          <button className="btn-primary" onClick={handleNewEngenheiro}>
            Novo Engenheiro
          </button>
        )}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="engenheiros-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Obras</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {engenheiros.length > 0 ? (
                engenheiros.map((eng) => (
                  <tr key={eng._id}>
                    <td>{eng.name}</td>
                    <td>{eng.email}</td>
                    <td>
                      {eng.obras.length > 0
                        ? eng.obras.map((obra) => obra.name).join(", ")
                        : "Sem obras"}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleEdit(eng)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(eng._id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Nenhum engenheiro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {showForm && (
          <div className="engenheiro-form">
            <h3>{editEngenheiroId ? "Editar Engenheiro" : "Novo Engenheiro"}</h3>
            <form onSubmit={handleSaveEngenheiro}>
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
                <label>Obras</label>
                <Select
                  isMulti
                  options={obraOptions}
                  value={engenheiroObras}
                  onChange={(selectedOptions) =>
                    setEngenheiroObras(selectedOptions || [])
                  }
                  placeholder="Selecione as obras"
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

export default Engenheiros;
