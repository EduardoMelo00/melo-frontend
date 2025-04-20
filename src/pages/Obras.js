// src/pages/Obras.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout"; // Layout com sidebar
import api from "../services/api";
import "./Obras.css";

function Obras() {
  // Estados
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário (para criar/editar)
  const [showForm, setShowForm] = useState(false);
  const [editObraId, setEditObraId] = useState(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Mensagens de erro ou sucesso
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1) Carregar a lista de obras
  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      setLoading(true);
      const res = await api.get("/obras");
      setObras(res.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao carregar lista de obras.");
    } finally {
      setLoading(false);
    }
  };

  // 2) Abrir formulário para CRIAR obra
  const handleNewObra = () => {
    setEditObraId(null);
    setName("");
    setLocation("");
    setDescription("");
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 3) Abrir formulário para EDITAR obra
  const handleEdit = (obra) => {
    setEditObraId(obra._id);
    setName(obra.name);
    setLocation(obra.location);
    setDescription(obra.description);
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  // 4) Salvar obra (criar ou editar)
  const handleSaveObra = async (e) => {
    e.preventDefault();
    try {
      if (editObraId) {
        // Atualizar obra
        await api.put(`/obras/${editObraId}`, {
          name,
          location,
          description,
        });
        setSuccessMsg("Obra atualizada com sucesso!");
      } else {
        // Criar nova obra
        await api.post("/obras", {
          name,
          location,
          description,
        });
        setSuccessMsg("Obra criada com sucesso!");
      }

      // Recarregar lista e fechar formulário
      fetchObras();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao salvar obra.");
    }
  };

  // 5) Excluir obra
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta obra?")) return;
    try {
      await api.delete(`/obras/${id}`);
      setSuccessMsg("Obra excluída com sucesso!");
      fetchObras();
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao excluir obra.");
    }
  };

  return (
    <Layout>
      <div className="obras-container">
        <h2>Gerenciar Obras</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* Botão de nova obra */}
        {!showForm && (
          <button className="btn-primary" onClick={handleNewObra}>
            Nova Obra
          </button>
        )}

        {/* Lista de obras */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="obras-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Localização</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra._id}>
                  <td>{obra.name}</td>
                  <td>{obra.location}</td>
                  <td>{obra.description}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(obra)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(obra._id)}
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
          <div className="obra-form">
            <h3>{editObraId ? "Editar Obra" : "Nova Obra"}</h3>
            <form onSubmit={handleSaveObra}>
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
                <label>Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

export default Obras;
