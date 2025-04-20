// src/pages/Pedidos.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [obras, setObras] = useState([]); // State para as obras
  const [isEditing, setIsEditing] = useState(false);
  const [currentPedido, setCurrentPedido] = useState(null);
  const [filters, setFilters] = useState({
    obra: "",
    fornecedor: "",
    dataInicio: "",
    dataFim: "",
  });
  const location = useLocation();

  useEffect(() => {
    fetchPedidos();
    fetchFornecedores();
    fetchItems();
    fetchObras(); // Busca as obras cadastradas

    if (location.state && location.state.pedido) {
      setIsEditing(true);
      setCurrentPedido(location.state.pedido);
    }
  }, []);

  // Busca os pedidos conforme os filtros
  const fetchPedidos = async () => {
    try {
      const queryParams = { ...filters };
      // Remove filtros vazios
      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });
      const res = await api.get("/pedidos", { params: queryParams });
      console.log("Dados recebidos:", res.data);
      setPedidos(res.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos", error);
    }
  };

  // Busca os fornecedores
  const fetchFornecedores = async () => {
    try {
      const res = await api.get("/fornecedores");
      setFornecedores(res.data);
    } catch (error) {
      console.error("Erro ao carregar fornecedores", error);
    }
  };

  // Busca os itens disponíveis
  const fetchItems = async () => {
    try {
      const res = await api.get("/items");
      setAvailableItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar itens do banco", error);
    }
  };

  // Busca as obras (endpoint /obras)
  const fetchObras = async () => {
    try {
      const res = await api.get("/obras");
      setObras(res.data);
    } catch (error) {
      console.error("Erro ao carregar obras", error);
    }
  };

  // Inicia um novo pedido
  const handleNewPedido = () => {
    setIsEditing(true);
    setCurrentPedido({
      obra: "",
      fornecedor: "",
      observacao: "",
      items: [],
      frete: 0,
      totalGeral: 0,
    });
  };

  // Edita um pedido existente
  const handleEditPedido = (pedido) => {
    setIsEditing(true);
    setCurrentPedido(pedido);
  };

  // Salva (cria ou atualiza) um pedido
  const handleSavePedido = async (e) => {
    e.preventDefault();
    try {
      if (currentPedido._id) {
        await api.put(`/pedidos/${currentPedido._id}`, currentPedido);
      } else {
        await api.post("/pedidos", currentPedido);
      }
      fetchPedidos();
      setIsEditing(false);
      setCurrentPedido(null);
    } catch (error) {
      console.error("Erro ao salvar pedido", error);
    }
  };

  // Exclui um pedido
  const handleDeletePedido = async (id) => {
    try {
      await api.delete(`/pedidos/${id}`);
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao excluir pedido", error);
    }
  };

  // Duplicar um pedido
  const handleDuplicatePedido = async (id) => {
    try {
      const res = await api.post(`/pedidos/${id}/copy`);
      fetchPedidos();
      setCurrentPedido(res.data.pedido);
      setIsEditing(true);
    } catch (error) {
      console.error("Erro ao duplicar pedido", error);
    }
  };

  // Cancela a edição/criação
  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPedido(null);
  };

  // Adiciona um novo item ao pedido
  const handleAddItem = () => {
    const newItem = {
      discriminacao: "",
      quantidade: 1,
      unidade: "",
      precoUnitario: 0,
      precoTotal: 0,
    };
    // Calcula o preço total inicial do item
    newItem.precoTotal = newItem.quantidade * newItem.precoUnitario;
    const updatedItems = [...currentPedido.items, newItem];
    const totalGeral = updatedItems.reduce(
      (sum, item) => sum + (item.precoTotal || 0),
      currentPedido.frete || 0
    );
    setCurrentPedido({ ...currentPedido, items: updatedItems, totalGeral });
  };

  // Atualiza um item do pedido e recalcula totais
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...currentPedido.items];
    updatedItems[index][field] = value;

    if (field === "discriminacao") {
      const selectedItem = availableItems.find(
        (item) => item.discriminacao === value
      );
      updatedItems[index].precoUnitario = selectedItem?.precoUnitario || 0;
      updatedItems[index].unidade = selectedItem?.unidade || "";
    }

    if (
      field === "quantidade" ||
      field === "precoUnitario" ||
      field === "discriminacao"
    ) {
      updatedItems[index].precoTotal =
        (updatedItems[index].quantidade || 0) *
        (updatedItems[index].precoUnitario || 0);
    }

    // Recalcula o total geral considerando o frete
    const totalGeral = updatedItems.reduce(
      (sum, item) => sum + (item.precoTotal || 0),
      parseFloat(currentPedido.frete) || 0
    );
    setCurrentPedido({ ...currentPedido, items: updatedItems, totalGeral });
  };

  // Função auxiliar para carregar imagens (usada no PDF)
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  // Exporta o pedido para PDF
  const handleExportPDF = async () => {
    try {
      const logoUrl = `${window.location.origin}/logo.png`;
      const logo = await loadImage(logoUrl);
      const pdfContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; width: 800px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Logo" style="width: 150px;"/>
          </div>
          <h1 style="text-align: center; color: #006e3f;">PEDIDO DE COMPRA</h1>
          <div style="margin-bottom: 20px;">
            <p><strong>EMPRESA:</strong> Melo Engenharia</p>
            <p><strong>ENDEREÇO:</strong> Av. Guadalajara, nº 04, loteamento parque residencial Nova Caruaru, bairro nova Caruaru.</p>
            <p><strong>CNPJ:</strong> 26.914.893/0001-74</p>
            <p><strong>TELEFONE:</strong> (81) 992762401</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p><strong>FORNECEDOR:</strong> ${
              fornecedores.find((f) => f._id === currentPedido.fornecedor)
                ?.fornecedor || "N/A"
            }</p>
            <p><strong>OBRA:</strong> ${
              typeof currentPedido.obra === "object"
                ? currentPedido.obra.name
                : "N/A"
            }</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 5px;">ITEM</th>
                <th style="border: 1px solid #000; padding: 5px;">DESCRIÇÃO</th>
                <th style="border: 1px solid #000; padding: 5px;">QUANT.</th>
                <th style="border: 1px solid #000; padding: 5px;">UNIDADE</th>
                <th style="border: 1px solid #000; padding: 5px;">PREÇO UNIT.</th>
                <th style="border: 1px solid #000; padding: 5px;">PREÇO TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${currentPedido.items
                .map(
                  (item, index) => `
                <tr>
                  <td style="border: 1px solid #000; padding: 5px; text-align: center;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px;">${
                    item.discriminacao
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: center;">${
                    item.quantidade
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: center;">${
                    item.unidade
                  }</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: right;">R$ ${parseFloat(
                    item.precoUnitario
                  ).toFixed(2)}</td>
                  <td style="border: 1px solid #000; padding: 5px; text-align: right;">R$ ${parseFloat(
                    item.precoTotal
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <p style="text-align: right; font-size: 16px;"><strong>TOTAL GERAL:</strong> R$ ${parseFloat(
            currentPedido.totalGeral
          ).toFixed(2)}</p>
        </div>
      `;

      const pdfContainer = document.createElement("div");
      pdfContainer.innerHTML = pdfContent;
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Adiciona o logo e o conteúdo gerado
      pdf.addImage(logo, "PNG", 10, 10, 40, 15);
      pdf.addImage(imgData, "PNG", 0, 30, pdfWidth, pdfHeight - 30);
      pdf.save(`pedido_${currentPedido.numeroPedido || "novo"}.pdf`);

      document.body.removeChild(pdfContainer);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
  };

  return (
    <Layout>
      <div className="pedido-form">
        {!isEditing ? (
          <>
            <h3>Gerenciar Pedidos</h3>
            <div className="form-row">
              <input
                type="text"
                name="obra"
                placeholder="Filtrar por obra"
                value={filters.obra}
                onChange={(e) =>
                  setFilters({ ...filters, obra: e.target.value })
                }
              />
              <input
                type="text"
                name="fornecedor"
                placeholder="Filtrar por fornecedor"
                value={filters.fornecedor}
                onChange={(e) =>
                  setFilters({ ...filters, fornecedor: e.target.value })
                }
              />
              <input
                type="date"
                name="dataInicio"
                value={filters.dataInicio}
                onChange={(e) =>
                  setFilters({ ...filters, dataInicio: e.target.value })
                }
              />
              <input
                type="date"
                name="dataFim"
                value={filters.dataFim}
                onChange={(e) =>
                  setFilters({ ...filters, dataFim: e.target.value })
                }
              />
              <button className="btn-primary" onClick={fetchPedidos}>
                Filtrar
              </button>
              <button className="btn-primary" onClick={handleNewPedido}>
                Novo Pedido
              </button>
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Obra</th>
                  <th>Fornecedor</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  console.log(pedido),
                  <tr key={pedido._id}>
                    <td>{pedido.numeroPedido}</td>
                    <td>{pedido.obra?.name || "N/A"}</td>
                    <td>{pedido.fornecedor?.fornecedor || "N/A"}</td>
                    <td>{pedido.status}</td>
                    <td>R$ {parseFloat(pedido.totalGeral).toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleEditPedido(pedido)}>
                        Editar
                      </button>
                      <button onClick={() => handleDuplicatePedido(pedido._id)}>
                        Duplicar
                      </button>
                      <button onClick={() => handleDeletePedido(pedido._id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h3>{currentPedido._id ? "Editar Pedido" : "Novo Pedido"}</h3>
            <div id="pedido-pdf">
              <form>
                <div className="form-row">
                  <label>Fornecedor</label>
                  <select
                      value={
                        currentPedido.fornecedor && typeof currentPedido.fornecedor === "object"
                        ? currentPedido.fornecedor._id
                        : (currentPedido.fornecedor || "")
                      }
                      onChange={(e) =>
                        setCurrentPedido({
                          ...currentPedido,
                          fornecedor: e.target.value,
                        })
                      }
                    >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor._id} value={fornecedor._id}>
                        {fornecedor.fornecedor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>Obra</label>
                  {/* ComboBox de obras */}
                  <select
                    value={
                      typeof currentPedido.obra === "object"
                        ? currentPedido.obra._id
                        : currentPedido.obra
                    }
                    onChange={(e) =>
                      setCurrentPedido({
                        ...currentPedido,
                        obra: e.target.value,
                      })
                    }
                  >
                    <option value="">Selecione uma obra</option>
                    {obras.map((obra) => (
                      <option key={obra._id} value={obra._id}>
                        {obra.name || obra.titulo || "Sem nome"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <label>Observação</label>
                  <input
                    type="text"
                    value={currentPedido.observacao}
                    onChange={(e) =>
                      setCurrentPedido({
                        ...currentPedido,
                        observacao: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-section">
                  <h4>Items</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Unidade</th>
                        <th>Preço Unitário</th>
                        <th>Preço Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPedido.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={item.discriminacao}
                              onChange={(e) => {
                                const selectedItem = availableItems.find(
                                  (availableItem) =>
                                    availableItem.discriminacao === e.target.value
                                );
                                handleItemChange(
                                  index,
                                  "discriminacao",
                                  e.target.value
                                );
                                handleItemChange(
                                  index,
                                  "unidade",
                                  selectedItem ? selectedItem.unidade : ""
                                );
                              }}
                            >
                              <option value="">Selecione um item</option>
                              {availableItems.map((availableItem) => (
                                <option
                                  key={availableItem._id}
                                  value={availableItem.discriminacao}
                                >
                                  {availableItem.discriminacao}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) =>
                                handleItemChange(index, "quantidade", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input type="text" value={item.unidade} readOnly />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.precoUnitario}
                              onChange={(e) =>
                                handleItemChange(index, "precoUnitario", e.target.value)
                              }
                            />
                          </td>
                          <td>R$ {parseFloat(item.precoTotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddItem}
                  >
                    + Adicionar Item
                  </button>
                </div>

                <div className="form-row">
                  <label>Frete</label>
                  <input
                    type="number"
                    value={currentPedido.frete}
                    onChange={(e) =>
                      setCurrentPedido({
                        ...currentPedido,
                        frete: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="total-geral">
                  <p>
                    Total Geral: R$ {parseFloat(currentPedido.totalGeral).toFixed(2)}
                  </p>
                </div>
              </form>
            </div>
            <div id="pedido-pdf">
              <form onSubmit={handleSavePedido}>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </form>
            </div>
            <button className="btn-primary" onClick={handleExportPDF}>
              Exportar para PDF
            </button>
            <button className="btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Pedidos;
