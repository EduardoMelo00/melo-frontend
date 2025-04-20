import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function SolicitacoesAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/solicitacoes");
      setSolicitacoes(res.data);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      setErrorMsg("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCriarPedido = async (solicitacao) => {

    console.log(" SOLICITACAO ",solicitacao);
    try {
      const novoPedido = {
        obra: solicitacao.obra?._id , // Garantir que seja apenas o ID
        items: solicitacao.itens.map((item) => {
          const precoUnitario = item.itemId?.precoUnitario ? Number(item.itemId.precoUnitario) : 0;
          const quantidade = item.quantidade ? Number(item.quantidade) : 0;
          return {
            discriminacao: item.itemId?.discriminacao || "Desconhecido",
            quantidade,
            unidade: item.itemId?.unidade || "N/A",
            precoUnitario,
            precoTotal: quantidade * precoUnitario, // Certificar-se de que o cálculo é correto
          };
        }),
        fornecedor: solicitacao.fornecedor?._id || solicitacao.fornecedor || null, // Garantir um ID válido
        observacao: solicitacao.observacao || "",
        frete: solicitacao.frete ? Number(solicitacao.frete) : 0, // Garantir que seja um número
        totalGeral: solicitacao.itens.reduce(
          (total, item) => {
            const preco = item.itemId?.precoUnitario ? Number(item.itemId.precoUnitario) : 0;
            const quantidade = item.quantidade ? Number(item.quantidade) : 0;
            return total + quantidade * preco;
          },
          0
        ),
      };
  
      console.log("Enviando pedido:", novoPedido); // Debug para verificar os dados antes de enviar
  
      const response = await api.post("/pedidos", novoPedido);
      alert("Pedido criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao criar pedido. Tente novamente.");
    }
  };
  
  

  return (
    <Layout>
      <div className="solicitacoes-container">
        <h2>Solicitações (Admin)</h2>

        {errorMsg && <p className="msg-error">{errorMsg}</p>}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="solicitacoes-table">
            <thead>
              <tr>
                <th>Obra</th>
                <th>Itens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((solicitacao) => (
                <tr key={solicitacao._id}>
                  <td>{solicitacao.obra?.name || "N/A"}</td>
                  <td>
                    {solicitacao.itens.map((item, index) => (
                      <div key={index}>
                        {item.itemId?.discriminacao || "N/A"} -{" "}
                        {item.quantidade}
                      </div>
                    ))}
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => handleCriarPedido(solicitacao)}
                    >
                      Criar Pedido
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

export default SolicitacoesAdmin;
