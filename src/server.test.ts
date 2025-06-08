import { close, connect } from "mcp-testing-kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as sdk from "./client/sdk.gen";
import { server as mcpServer } from "./server";

vi.mock("./client/sdk.gen");
vi.mock("axios");

describe("MCP Server", () => {
  afterEach(async () => {
    await close(mcpServer.server);
    vi.clearAllMocks();
  });

  it("should have all tools", async () => {
    const client = await connect(mcpServer.server);
    const result = await client.listTools();
    expect(result.tools).toEqual([
      expect.objectContaining({ name: "bling_list_propostas" }),
      expect.objectContaining({ name: "bling_create_proposta" }),
      expect.objectContaining({ name: "bling_get_proposta" }),
      expect.objectContaining({ name: "bling_update_proposta" }),
      expect.objectContaining({ name: "bling_update_proposta_situacao" }),
      expect.objectContaining({ name: "bling_delete_proposta" }),
    ]);
  });
});

describe("bling_list_propostas", () => {
  it("should list proposals without filters", async () => {
    vi.mocked(sdk.getPropostasComerciais).mockResolvedValue({
      data: {
        data: [
          { id: 123, numero: "001", situacao: "Pendente" },
          { id: 456, numero: "002", situacao: "Aprovado" },
        ],
      },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_list_propostas", {});
    expect(result.content).toEqual([
      {
        type: "text",
        text: JSON.stringify({
          data: [
            { id: 123, numero: "001", situacao: "Pendente" },
            { id: 456, numero: "002", situacao: "Aprovado" },
          ],
        }),
      },
    ]);
    expect(sdk.getPropostasComerciais).toHaveBeenCalledWith({
      query: {},
      throwOnError: true,
    });
  });

  it("should list proposals with filters", async () => {
    vi.mocked(sdk.getPropostasComerciais).mockResolvedValue({
      data: {
        data: [{ id: 123, numero: "001", situacao: "Pendente" }],
      },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_list_propostas", {
      situacao: "Pendente",
      idContato: 789,
      dataInicial: "2024-01-01",
      dataFinal: "2024-12-31",
      pagina: 1,
      limite: 10,
    });
    expect(result.content).toEqual([
      {
        type: "text",
        text: JSON.stringify({
          data: [{ id: 123, numero: "001", situacao: "Pendente" }],
        }),
      },
    ]);
    expect(sdk.getPropostasComerciais).toHaveBeenCalledWith({
      query: {
        situacao: "Pendente",
        idContato: 789,
        dataInicial: "2024-01-01",
        dataFinal: "2024-12-31",
        pagina: 1,
        limite: 10,
      },
      throwOnError: true,
    });
  });

  it("should show error if list proposals throws", async () => {
    vi.mocked(sdk.getPropostasComerciais).mockRejectedValue(new Error("API Error"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_list_propostas", {});
    expect(result.content).toEqual([{ type: "text", text: "Failed to list proposals: Error: API Error" }]);
    expect(result.isError).toBe(true);
  });
});

describe("bling_create_proposta", () => {
  const mockProposta = {
    data: "2024-03-20",
    situacao: "Pendente",
    numero: 123,
    contato: { id: 789 },
    itens: [
      {
        produto: { id: 456 },
        quantidade: 2,
        valor: 100.50,
      },
    ],
    parcelas: [
      {
        numeroDias: 30,
        valor: 201.00,
        formaPagamento: { id: 1 },
      },
    ],
  };

  it("should create proposal successfully", async () => {
    vi.mocked(sdk.postPropostasComerciais).mockResolvedValue({
      data: { id: 123 },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_create_proposta", { proposta: mockProposta });
    expect(result.content).toEqual([
      {
        type: "text",
        text: JSON.stringify({ id: 123 }),
      },
    ]);
    expect(sdk.postPropostasComerciais).toHaveBeenCalledWith({
      body: mockProposta,
      throwOnError: true,
    });
  });

  it("should show error if create proposal throws", async () => {
    vi.mocked(sdk.postPropostasComerciais).mockRejectedValue(new Error("Creation failed"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_create_proposta", { proposta: mockProposta });
    expect(result.content).toEqual([{ type: "text", text: "Failed to create proposal: Error: Creation failed" }]);
    expect(result.isError).toBe(true);
  });
});

describe("bling_get_proposta", () => {
  it("should get proposal successfully", async () => {
    const mockProposta = {
      id: 123,
      numero: "001",
      situacao: "Pendente",
      data: "2024-03-20",
    };

    vi.mocked(sdk.getPropostasComerciaisByIdPropostaComercial).mockResolvedValue({
      data: mockProposta,
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_get_proposta", { idPropostaComercial: 123 });
    expect(result.content).toEqual([
      {
        type: "text",
        text: JSON.stringify(mockProposta),
      },
    ]);
    expect(sdk.getPropostasComerciaisByIdPropostaComercial).toHaveBeenCalledWith({
      path: { idPropostaComercial: 123 },
      throwOnError: true,
    });
  });

  it("should show error if get proposal throws", async () => {
    vi.mocked(sdk.getPropostasComerciaisByIdPropostaComercial).mockRejectedValue(new Error("Not found"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_get_proposta", { idPropostaComercial: 123 });
    expect(result.content).toEqual([{ type: "text", text: "Failed to get proposal: Error: Not found" }]);
    expect(result.isError).toBe(true);
  });
});

describe("bling_update_proposta", () => {
  const mockProposta = {
    data: "2024-03-21",
    situacao: "Aprovado",
    observacoes: "Updated proposal",
  };

  it("should update proposal successfully", async () => {
    vi.mocked(sdk.putPropostasComerciaisByIdPropostaComercial).mockResolvedValue({
      data: { message: "Success" },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_update_proposta", {
      idPropostaComercial: 123,
      proposta: mockProposta,
    });
    expect(result.content).toEqual([
      {
        type: "text",
        text: "Proposal updated successfully",
      },
    ]);
    expect(sdk.putPropostasComerciaisByIdPropostaComercial).toHaveBeenCalledWith({
      path: { idPropostaComercial: 123 },
      body: mockProposta,
      throwOnError: true,
    });
  });

  it("should show error if update proposal throws", async () => {
    vi.mocked(sdk.putPropostasComerciaisByIdPropostaComercial).mockRejectedValue(new Error("Update failed"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_update_proposta", {
      idPropostaComercial: 123,
      proposta: mockProposta,
    });
    expect(result.content).toEqual([{ type: "text", text: "Failed to update proposal: Error: Update failed" }]);
    expect(result.isError).toBe(true);
  });
});

describe("bling_update_proposta_situacao", () => {
  it("should update proposal status successfully", async () => {
    vi.mocked(sdk.patchPropostasComerciaisByIdPropostaComercialSituacoes).mockResolvedValue({
      data: { message: "Success" },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_update_proposta_situacao", {
      idPropostaComercial: 123,
      situacao: { situacao: "Aprovado" },
    });
    expect(result.content).toEqual([
      {
        type: "text",
        text: "Proposal status updated successfully",
      },
    ]);
    expect(sdk.patchPropostasComerciaisByIdPropostaComercialSituacoes).toHaveBeenCalledWith({
      path: { idPropostaComercial: 123 },
      body: { situacao: "Aprovado" },
      throwOnError: true,
    });
  });

  it("should show error if update status throws", async () => {
    vi.mocked(sdk.patchPropostasComerciaisByIdPropostaComercialSituacoes).mockRejectedValue(new Error("Status update failed"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_update_proposta_situacao", {
      idPropostaComercial: 123,
      situacao: { situacao: "Aprovado" },
    });
    expect(result.content).toEqual([{ type: "text", text: "Failed to update proposal status: Error: Status update failed" }]);
    expect(result.isError).toBe(true);
  });
});

describe("bling_delete_proposta", () => {
  it("should delete proposal successfully", async () => {
    vi.mocked(sdk.deletePropostasComerciaisByIdPropostaComercial).mockResolvedValue({
      data: { message: "Success" },
    } as any);

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_delete_proposta", { idPropostaComercial: 123 });
    expect(result.content).toEqual([
      {
        type: "text",
        text: "Proposal deleted successfully",
      },
    ]);
    expect(sdk.deletePropostasComerciaisByIdPropostaComercial).toHaveBeenCalledWith({
      path: { idPropostaComercial: 123 },
      throwOnError: true,
    });
  });

  it("should show error if delete proposal throws", async () => {
    vi.mocked(sdk.deletePropostasComerciaisByIdPropostaComercial).mockRejectedValue(new Error("Delete failed"));

    const client = await connect(mcpServer.server);
    const result = await client.callTool("bling_delete_proposta", { idPropostaComercial: 123 });
    expect(result.content).toEqual([{ type: "text", text: "Failed to delete proposal: Error: Delete failed" }]);
    expect(result.isError).toBe(true);
  });
});
