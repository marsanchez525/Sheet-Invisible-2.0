// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres "Excel Invisible AI", un asistente experto en contabilidad, finanzas, nóminas e inventarios para Colombia y LATAM.

Tu trabajo:
- Si el usuario adjunta un Excel, recibirás su contenido como JSON con las hojas y celdas.
- Analiza, transforma, limpia o agrega cálculos según lo pedido en lenguaje natural.
- Cuando el usuario pida MODIFICAR el archivo, devuelve la respuesta usando la herramienta 'modify_excel' con la estructura final.
- Cuando solo pida ANÁLISIS o RESUMEN, responde en markdown claro y profesional con tablas, bullets y recomendaciones.
- Usa fórmulas reales de Excel (=SUMA, =SI, =BUSCARV, =SUMAR.SI, etc.) cuando agregues cálculos.
- Sé conciso, profesional y didáctico. Explica brevemente qué hiciste.
- Responde SIEMPRE en español.`;

const modifyExcelTool = {
  type: "function",
  function: {
    name: "modify_excel",
    description:
      "Devuelve el archivo Excel modificado. Úsala SOLO cuando el usuario pida cambiar, agregar fórmulas, limpiar datos, generar reportes o crear hojas nuevas.",
    parameters: {
      type: "object",
      properties: {
        explanation: {
          type: "string",
          description:
            "Resumen breve en markdown de qué cambios se aplicaron al archivo.",
        },
        sheets: {
          type: "array",
          description:
            "Lista de hojas del archivo final. Cada hoja contiene una matriz 2D de celdas. Las fórmulas deben empezar con '='.",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              data: {
                type: "array",
                items: {
                  type: "array",
                  items: { type: ["string", "number", "boolean", "null"] },
                },
              },
            },
            required: ["name", "data"],
          },
        },
      },
      required: ["explanation", "sheets"],
    },
  },
};

function parseExcelToJson(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const wb = XLSX.read(bytes, { type: "array" });
  const result: Record<string, any[][]> = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    result[name] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  }
  return result;
}

function buildExcelFromSheets(sheets: { name: string; data: any[][] }[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.data);
    // Convert string formulas starting with '=' into real formulas
    for (const cellRef in ws) {
      if (cellRef.startsWith("!")) continue;
      const cell = ws[cellRef];
      if (typeof cell.v === "string" && cell.v.startsWith("=")) {
        cell.f = cell.v.substring(1);
        delete cell.v;
        cell.t = "n";
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, s.name.substring(0, 31));
  }
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  // base64 encode
  let bin = "";
  const bytes = new Uint8Array(out);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const { messages, fileBase64, fileName } = await req.json();

    let excelContext = "";
    if (fileBase64) {
      try {
        const parsed = parseExcelToJson(fileBase64);
        // Truncate huge sheets
        const trimmed: Record<string, any[][]> = {};
        for (const [k, v] of Object.entries(parsed)) {
          trimmed[k] = (v as any[][]).slice(0, 200);
        }
        excelContext = `\n\n📎 Archivo adjunto: **${fileName}**\nContenido (primeras 200 filas por hoja):\n\`\`\`json\n${JSON.stringify(trimmed, null, 2).substring(0, 12000)}\n\`\`\``;
      } catch (e) {
        excelContext = `\n\n⚠️ No se pudo leer el archivo: ${(e as Error).message}`;
      }
    }

    // Inject excel context into the LAST user message
    const finalMessages = [...messages];
    if (excelContext && finalMessages.length > 0) {
      const last = finalMessages[finalMessages.length - 1];
      if (last.role === "user") {
        last.content = last.content + excelContext;
      }
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...finalMessages,
          ],
          tools: fileBase64 ? [modifyExcelTool] : undefined,
        }),
      },
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "Sin créditos de IA. Agrega créditos en Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const txt = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, txt);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const choice = data.choices?.[0];
    const msg = choice?.message;

    // Tool call → modify excel
    const toolCall = msg?.tool_calls?.[0];
    if (toolCall?.function?.name === "modify_excel") {
      const args = JSON.parse(toolCall.function.arguments);
      const newBase64 = buildExcelFromSheets(args.sheets);
      return new Response(
        JSON.stringify({
          type: "file",
          explanation: args.explanation,
          fileBase64: newBase64,
          fileName: `procesado_${fileName || "archivo.xlsx"}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ type: "text", content: msg?.content || "Sin respuesta" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("excel-ai-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
