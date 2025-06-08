import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import z from "zod";
import packageJson from "../package.json";
import {
  getPropostasComerciais,
  postPropostasComerciais,
  getPropostasComerciaisByIdPropostaComercial,
  putPropostasComerciaisByIdPropostaComercial,
  patchPropostasComerciaisByIdPropostaComercialSituacoes,
  deletePropostasComerciaisByIdPropostaComercial,
} from "./client/sdk.gen";

export const server = new McpServer({
  name: "bling",
  version: packageJson.version,
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "bling_list_propostas",
  "List or search available commercial proposals",
  {
    situacao: z.string().optional().describe("Filter by proposal status (Pendente, Aguardando, Não aprovado, Aprovado, Concluido, Rascunho)"),
    idContato: z.number().optional().describe("Filter by contact ID"),
    dataInicial: z.string().optional().describe("Filter by initial date"),
    dataFinal: z.string().optional().describe("Filter by final date"),
    pagina: z.number().optional().describe("Page number for pagination"),
    limite: z.number().optional().describe("Number of records per page"),
  },
  async ({ situacao, idContato, dataInicial, dataFinal, pagina, limite }): Promise<CallToolResult> => {
    try {
      const resp = await getPropostasComerciais({
        query: {
          situacao,
          idContato,
          dataInicial,
          dataFinal,
          pagina,
          limite,
        },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to list proposals: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "bling_create_proposta",
  "Create a new commercial proposal",
  {
    proposta: z.object({
      // Base fields
      data: z.string().optional().describe("Date of the proposal"),
      situacao: z.string().optional().describe("Status of the proposal"),
      numero: z.number().optional().describe("Proposal number"),
      contato: z.object({
        id: z.number().describe("Contact ID"),
      }).optional().describe("Contact information"),
      loja: z.object({
        id: z.number().describe("Store ID"),
      }).optional().describe("Store information"),
      // Additional fields
      desconto: z.number().optional().describe("Discount amount"),
      outrasDespesas: z.number().optional().describe("Other expenses"),
      garantia: z.number().optional().describe("Warranty period in days"),
      dataProximoContato: z.string().optional().describe("Next contact date"),
      observacoes: z.string().optional().describe("Observations"),
      observacaoInterna: z.string().optional().describe("Internal observations"),
      totalOutrosItens: z.number().optional().describe("Total of other items"),
      aosCuidadosDe: z.string().optional().describe("Care of"),
      introducao: z.string().optional().describe("Introduction text"),
      prazoEntrega: z.string().optional().describe("Delivery deadline"),
      itens: z.array(z.object({
        // Add required item fields here
        produto: z.object({
          id: z.number().describe("Product ID"),
        }).describe("Product information"),
        quantidade: z.number().describe("Quantity"),
        valor: z.number().describe("Unit value"),
      })).describe("Proposal items"),
      parcelas: z.array(z.object({
        numeroDias: z.number().optional().describe("Number of days until payment"),
        dataVencimento: z.string().optional().describe("Due date"),
        valor: z.number().optional().describe("Payment value"),
        observacoes: z.string().optional().describe("Payment observations"),
        formaPagamento: z.object({
          id: z.number().describe("Payment method ID"),
        }).optional().describe("Payment method"),
      })).describe("Payment installments"),
      vendedor: z.object({
        id: z.number().describe("Salesperson ID"),
      }).optional().describe("Salesperson information"),
      transporte: z.object({
        freteModalidade: z.number().optional().describe("Freight modality (0=CIF, 1=FOB, 2=Third party, 3=Own sender, 4=Own recipient, 9=None)"),
        frete: z.number().optional().describe("Freight value"),
        quantidadeVolumes: z.number().optional().describe("Number of volumes"),
        prazoEntrega: z.number().optional().describe("Delivery deadline in days"),
        pesoBruto: z.number().optional().describe("Gross weight"),
        contato: z.object({
          id: z.number().describe("Contact ID"),
        }).optional().describe("Transport contact information"),
        volumes: z.object({
          // Add required volume fields here
        }).optional().describe("Volume information"),
      }).optional().describe("Transport information"),
    }).describe("The proposal data to create"),
  },
  async ({ proposta }): Promise<CallToolResult> => {
    try {
      const resp = await postPropostasComerciais({
        body: proposta as any, // Type assertion needed due to complex nested types
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to create proposal: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "bling_get_proposta",
  "Get a commercial proposal by ID",
  {
    idPropostaComercial: z.number().describe("The ID of the proposal to get"),
  },
  async ({ idPropostaComercial }): Promise<CallToolResult> => {
    try {
      const resp = await getPropostasComerciaisByIdPropostaComercial({
        path: { idPropostaComercial },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: JSON.stringify(resp.data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to get proposal: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "bling_update_proposta",
  "Update a commercial proposal",
  {
    idPropostaComercial: z.number().describe("The ID of the proposal to update"),
    proposta: z.object({
      // Base fields
      data: z.string().optional().describe("Date of the proposal"),
      situacao: z.string().optional().describe("Status of the proposal"),
      numero: z.number().optional().describe("Proposal number"),
      contato: z.object({
        id: z.number().describe("Contact ID"),
      }).optional().describe("Contact information"),
      loja: z.object({
        id: z.number().describe("Store ID"),
      }).optional().describe("Store information"),
      // Additional fields
      desconto: z.number().optional().describe("Discount amount"),
      outrasDespesas: z.number().optional().describe("Other expenses"),
      garantia: z.number().optional().describe("Warranty period in days"),
      dataProximoContato: z.string().optional().describe("Next contact date"),
      observacoes: z.string().optional().describe("Observations"),
      observacaoInterna: z.string().optional().describe("Internal observations"),
      totalOutrosItens: z.number().optional().describe("Total of other items"),
      aosCuidadosDe: z.string().optional().describe("Care of"),
      introducao: z.string().optional().describe("Introduction text"),
      prazoEntrega: z.string().optional().describe("Delivery deadline"),
      itens: z.array(z.object({
        // Add required item fields here
        produto: z.object({
          id: z.number().describe("Product ID"),
        }).describe("Product information"),
        quantidade: z.number().describe("Quantity"),
        valor: z.number().describe("Unit value"),
      })).describe("Proposal items"),
      parcelas: z.array(z.object({
        numeroDias: z.number().optional().describe("Number of days until payment"),
        dataVencimento: z.string().optional().describe("Due date"),
        valor: z.number().optional().describe("Payment value"),
        observacoes: z.string().optional().describe("Payment observations"),
        formaPagamento: z.object({
          id: z.number().describe("Payment method ID"),
        }).optional().describe("Payment method"),
      })).describe("Payment installments"),
      vendedor: z.object({
        id: z.number().describe("Salesperson ID"),
      }).optional().describe("Salesperson information"),
      transporte: z.object({
        freteModalidade: z.number().optional().describe("Freight modality (0=CIF, 1=FOB, 2=Third party, 3=Own sender, 4=Own recipient, 9=None)"),
        frete: z.number().optional().describe("Freight value"),
        quantidadeVolumes: z.number().optional().describe("Number of volumes"),
        prazoEntrega: z.number().optional().describe("Delivery deadline in days"),
        pesoBruto: z.number().optional().describe("Gross weight"),
        contato: z.object({
          id: z.number().describe("Contact ID"),
        }).optional().describe("Transport contact information"),
        volumes: z.object({
          // Add required volume fields here
        }).optional().describe("Volume information"),
      }).optional().describe("Transport information"),
    }).describe("The updated proposal data"),
  },
  async ({ idPropostaComercial, proposta }): Promise<CallToolResult> => {
    try {
      await putPropostasComerciaisByIdPropostaComercial({
        path: { idPropostaComercial },
        body: proposta as any, // Type assertion needed due to complex nested types
        throwOnError: true,
      });

      return { content: [{ type: "text", text: "Proposal updated successfully" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to update proposal: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "bling_update_proposta_situacao",
  "Update the status of a commercial proposal",
  {
    idPropostaComercial: z.number().describe("The ID of the proposal to update"),
    situacao: z.object({
      situacao: z.enum(["Pendente", "Aguardando", "Não aprovado", "Aprovado", "Concluído", "Rascunho"]).optional().describe("New status of the proposal"),
    }).describe("The new status data"),
  },
  async ({ idPropostaComercial, situacao }): Promise<CallToolResult> => {
    try {
      await patchPropostasComerciaisByIdPropostaComercialSituacoes({
        path: { idPropostaComercial },
        body: situacao,
        throwOnError: true,
      });

      return { content: [{ type: "text", text: "Proposal status updated successfully" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to update proposal status: ${error}` }], isError: true };
    }
  },
);

server.tool(
  "bling_delete_proposta",
  "Delete a commercial proposal",
  {
    idPropostaComercial: z.number().describe("The ID of the proposal to delete"),
  },
  async ({ idPropostaComercial }): Promise<CallToolResult> => {
    try {
      await deletePropostasComerciaisByIdPropostaComercial({
        path: { idPropostaComercial },
        throwOnError: true,
      });

      return { content: [{ type: "text", text: "Proposal deleted successfully" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Failed to delete proposal: ${error}` }], isError: true };
    }
  },
);
