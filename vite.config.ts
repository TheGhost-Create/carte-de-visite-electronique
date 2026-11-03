import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type JsonResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (content?: string) => void;
};

function sendJson(res: JsonResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function vantajAiApiPlugin(apiKey: string, model: string): Plugin {
  return {
    name: "vantaj-ai-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/vantaj-ai/analyze", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed." });
          return;
        }

        if (!apiKey) {
          sendJson(res, 503, {
            error: "MISTRAL_API_KEY is not configured on the server.",
          });
          return;
        }

        try {
          let rawBody = "";
          req.setEncoding("utf8");

          for await (const chunk of req) {
            rawBody += chunk;
            if (rawBody.length > 10_000_000) {
              sendJson(res, 413, { error: "Image too large for Vantaj AI analysis." });
              return;
            }
          }

          const payload = JSON.parse(rawBody) as {
            kind?: "logo" | "legacy-card";
            imageDataUrl?: string;
            context?: Record<string, unknown>;
          };

          if (
            !payload.kind ||
            !payload.imageDataUrl ||
            !payload.imageDataUrl.startsWith("data:image/")
          ) {
            sendJson(res, 400, { error: "Invalid Vantaj AI image payload." });
            return;
          }

          const prompt =
            payload.kind === "logo"
              ? `Analyze this logo for a premium digital business card builder.
Return only a JSON object with:
primaryColor, secondaryColor, accentColor, recommendedBackground ("dark" or "light"), visualStyle, contrast ("low", "medium", "high"), typographyPreference, recommendedTemplates.
Use only these template ids when recommending: obsidian-flow, silver-architecture, midnight-metallic, arctic-minimal, titanium-wave, executive-black, digital-grid, glass-card, sapphire-edge, monogram-luxury, corporate-split, dynamic-ribbon, neo-corporate, pearl-navy, signature-vantaj.`
              : `Extract business card contact data from this image.
Return only a JSON object with a "fields" object. Each field must be an object with value, confidence ("high", "medium", "low"), and note.
Use only these fields: firstName, lastName, jobTitle, company, tagline, phone, whatsapp, email, website, address.
If a value is uncertain, include it with low confidence. If absent, omit it.`;

          const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: payload.imageDataUrl },
                  ],
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
            }),
          });

          const mistralPayload = (await mistralResponse.json()) as {
            choices?: Array<{ message?: { content?: unknown } }>;
            message?: string;
          };

          if (!mistralResponse.ok) {
            sendJson(res, mistralResponse.status, {
              error: mistralPayload.message ?? "Mistral analysis failed.",
            });
            return;
          }

          const content = mistralPayload.choices?.[0]?.message?.content;
          const textContent = Array.isArray(content)
            ? content
                .map((part) =>
                  typeof part === "object" &&
                  part !== null &&
                  "text" in part &&
                  typeof part.text === "string"
                    ? part.text
                    : "",
                )
                .join("")
            : String(content ?? "{}");

          sendJson(res, 200, {
            provider: "mistral",
            data: JSON.parse(textContent),
          });
        } catch {
          sendJson(res, 500, {
            error:
              "Vantaj AI n'a pas pu analyser cette image. Verifiez que l'image est nette puis reessayez.",
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), vantajAiApiPlugin(env.MISTRAL_API_KEY ?? "", env.MISTRAL_MODEL ?? "mistral-small-latest")],
    server: {
      host: "127.0.0.1",
      port: 5173,
    },
  };
});
