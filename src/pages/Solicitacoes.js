import React, { useEffect, useState } from "react";
import Layout from "../components/Layout"; // Layout com sidebar
import api from "../services/api";
import "./Solicitacoes.css";

function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [obras, setObras] = useState([]);
  const [itensDisponiveis, setItensDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário
  const [showForm, setShowForm] = useState(false);
  const [editSolicitacaoId, setEditSolicitacaoId] = useState(null);

  const [itens, setItens] = useState([{ itemId: "", quantidade: 1 }]);
  const [obra, setObra] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSolicitacoes();
    fetchObras();
    fetchItens();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/solicitacoes");
      setSolicitacoes(res.data);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      setErrorMsg("Erro ao carregar lista de solicitações.");
    } finally {
      setLoading(false);
    }
  };

  const fetchObras = async () => {
    try {
      const res = await api.get("/obras");
      setObras(res.data);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
      setErrorMsg("Erro ao carregar obras.");
    }
  };

  const fetchItens = async () => {
    try {
      const res = await api.get("/items");
      if (res.data && Array.isArray(res.data)) {
        setItensDisponiveis(res.data);
      } else {
        setErrorMsg("Formato inválido ao carregar itens disponíveis.");
      }
    } catch (error) {
      console.error("Erro ao carregar itens disponíveis:", error);
      setErrorMsg("Erro ao carregar itens disponíveis.");
    }
  };

  const handleNewSolicitacao = () => {
    setEditSolicitacaoId(null);
    setItens([{ itemId: "", quantidade: 1 }]); // Um item inicial vazio
    setObra(""); // Resetar obra selecionada
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSaveSolicitacao = async (e) => {
    e.preventDefault();

    if (!obra) {
      setErrorMsg("Selecione uma obra.");
      return;
    }

    if (itens.length === 0 || itens.some((item) => !item.itemId)) {
      setErrorMsg("Adicione ao menos um item e preencha todos os campos.");
      return;
    }

    const payload = {
      itens: itens.map((item) => ({
        itemId: item.itemId,
        quantidade: item.quantidade,
      })),
      obra,
    };

    try {
      if (editSolicitacaoId) {
        await api.put(`/solicitacoes/${editSolicitacaoId}`, payload);
        setSuccessMsg("Solicitação atualizada com sucesso!");
      } else {
        await api.post("/solicitacoes", payload);
        setSuccessMsg("Solicitação criada com sucesso!");
      }

      fetchSolicitacoes();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar solicitação:", error);
      setErrorMsg("Erro ao salvar solicitação.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta solicitação?")) return;
    try {
      await api.delete(`/solicitacoes/${id}`);
      setSuccessMsg("Solicitação excluída com sucesso!");
      fetchSolicitacoes();
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error);
      setErrorMsg("Erro ao excluir solicitação.");
    }
  };

  const handleAddItem = () => {
    setItens([...itens, { itemId: "", quantidade: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItens = [...itens];
    updatedItens[index][field] = value;
    setItens(updatedItens);
  };

  return (
    <Layout>
      <div className="solicitacoes-container">
        <h2>Gerenciar Solicitações</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {!showForm && (
          <button className="btn-primary" onClick={handleNewSolicitacao}>
            Nova Solicitação
          </button>
        )}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="solicitacoes-table">
            <thead>
              <tr>
                <th>Obra</th>
                <th>Itens / Quantidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => (
                <tr key={s._id}>
                  <td>{s.obra?.name || "N/A"}</td>
                  <td>
                    {Array.isArray(s.itens) && s.itens.length > 0 ? (
                      s.itens.map((item, index) => {
                        const itemDetails = itensDisponiveis.find(
                          (i) => i._id === item.itemId
                        );
                        return (
                          <div key={index}>
                            {itemDetails?.discriminacao || "N/A"} - {item.quantidade}
                          </div>
                        );
                      })
                    ) : (
                      <div>Nenhum item</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditSolicitacaoId(s._id);
                        setItens(s.itens || [{ itemId: "", quantidade: 1 }]);
                        setObra(s.obra?._id || "");
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(s._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showForm && (
          <form onSubmit={handleSaveSolicitacao}>
            <div className="form-group">
              <label>Obra</label>
              <select
                value={obra}
                onChange={(e) => setObra(e.target.value)}
                required
              >
                <option value="">Selecione uma obra</option>
                {obras.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Itens</label>
              {itens.map((item, index) => (
                <div key={index} className="item-row">
                  <select
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                    required
                  >
                    <option value="">Selecione um item</option>
                    {itensDisponiveis.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.discriminacao}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantidade}
                    onChange={(e) =>
                      handleItemChange(index, "quantidade", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddItem}
              >
                + Adicionar Item
              </button>
            </div>
            <div className="form-buttons">
              <button className="btn-primary" type="submit">
                Salvar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default Solicitacoes;
