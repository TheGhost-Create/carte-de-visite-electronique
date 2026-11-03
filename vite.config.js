var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
}
function vantajAiApiPlugin(apiKey, model) {
    return {
        name: "vantaj-ai-dev-api",
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use("/api/vantaj-ai/analyze", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var rawBody, chunk, e_1_1, payload, prompt_1, mistralResponse, mistralPayload, content, textContent, _a;
                var _b, req_1, req_1_1;
                var _c, e_1, _d, _e;
                var _f, _g, _h, _j;
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            if (req.method !== "POST") {
                                sendJson(res, 405, { error: "Method not allowed." });
                                return [2 /*return*/];
                            }
                            if (!apiKey) {
                                sendJson(res, 503, {
                                    error: "MISTRAL_API_KEY is not configured on the server.",
                                });
                                return [2 /*return*/];
                            }
                            _k.label = 1;
                        case 1:
                            _k.trys.push([1, 16, , 17]);
                            rawBody = "";
                            req.setEncoding("utf8");
                            _k.label = 2;
                        case 2:
                            _k.trys.push([2, 7, 8, 13]);
                            _b = true, req_1 = __asyncValues(req);
                            _k.label = 3;
                        case 3: return [4 /*yield*/, req_1.next()];
                        case 4:
                            if (!(req_1_1 = _k.sent(), _c = req_1_1.done, !_c)) return [3 /*break*/, 6];
                            _e = req_1_1.value;
                            _b = false;
                            chunk = _e;
                            rawBody += chunk;
                            if (rawBody.length > 10000000) {
                                sendJson(res, 413, { error: "Image too large for Vantaj AI analysis." });
                                return [2 /*return*/];
                            }
                            _k.label = 5;
                        case 5:
                            _b = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_1_1 = _k.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _k.trys.push([8, , 11, 12]);
                            if (!(!_b && !_c && (_d = req_1.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _d.call(req_1)];
                        case 9:
                            _k.sent();
                            _k.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13:
                            payload = JSON.parse(rawBody);
                            if (!payload.kind ||
                                !payload.imageDataUrl ||
                                !payload.imageDataUrl.startsWith("data:image/")) {
                                sendJson(res, 400, { error: "Invalid Vantaj AI image payload." });
                                return [2 /*return*/];
                            }
                            prompt_1 = payload.kind === "logo"
                                ? "Analyze this logo for a premium digital business card builder.\nReturn only a JSON object with:\nprimaryColor, secondaryColor, accentColor, recommendedBackground (\"dark\" or \"light\"), visualStyle, contrast (\"low\", \"medium\", \"high\"), typographyPreference, recommendedTemplates.\nUse only these template ids when recommending: obsidian-flow, silver-architecture, midnight-metallic, arctic-minimal, titanium-wave, executive-black, digital-grid, glass-card, sapphire-edge, monogram-luxury, corporate-split, dynamic-ribbon, neo-corporate, pearl-navy, signature-vantaj."
                                : "Extract business card contact data from this image.\nReturn only a JSON object with a \"fields\" object. Each field must be an object with value, confidence (\"high\", \"medium\", \"low\"), and note.\nUse only these fields: firstName, lastName, jobTitle, company, tagline, phone, whatsapp, email, website, address.\nIf a value is uncertain, include it with low confidence. If absent, omit it.";
                            return [4 /*yield*/, fetch("https://api.mistral.ai/v1/chat/completions", {
                                    method: "POST",
                                    headers: {
                                        Authorization: "Bearer ".concat(apiKey),
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        model: model,
                                        messages: [
                                            {
                                                role: "user",
                                                content: [
                                                    { type: "text", text: prompt_1 },
                                                    { type: "image_url", image_url: payload.imageDataUrl },
                                                ],
                                            },
                                        ],
                                        response_format: { type: "json_object" },
                                        temperature: 0.2,
                                    }),
                                })];
                        case 14:
                            mistralResponse = _k.sent();
                            return [4 /*yield*/, mistralResponse.json()];
                        case 15:
                            mistralPayload = (_k.sent());
                            if (!mistralResponse.ok) {
                                sendJson(res, mistralResponse.status, {
                                    error: (_f = mistralPayload.message) !== null && _f !== void 0 ? _f : "Mistral analysis failed.",
                                });
                                return [2 /*return*/];
                            }
                            content = (_j = (_h = (_g = mistralPayload.choices) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.content;
                            textContent = Array.isArray(content)
                                ? content
                                    .map(function (part) {
                                    return typeof part === "object" &&
                                        part !== null &&
                                        "text" in part &&
                                        typeof part.text === "string"
                                        ? part.text
                                        : "";
                                })
                                    .join("")
                                : String(content !== null && content !== void 0 ? content : "{}");
                            sendJson(res, 200, {
                                provider: "mistral",
                                data: JSON.parse(textContent),
                            });
                            return [3 /*break*/, 17];
                        case 16:
                            _a = _k.sent();
                            sendJson(res, 500, {
                                error: "Vantaj AI n'a pas pu analyser cette image. Verifiez que l'image est nette puis reessayez.",
                            });
                            return [3 /*break*/, 17];
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
}
export default defineConfig(function (_a) {
    var _b, _c;
    var mode = _a.mode;
    var env = loadEnv(mode, ".", "");
    return {
        plugins: [react(), vantajAiApiPlugin((_b = env.MISTRAL_API_KEY) !== null && _b !== void 0 ? _b : "", (_c = env.MISTRAL_MODEL) !== null && _c !== void 0 ? _c : "mistral-small-latest")],
        server: {
            host: "127.0.0.1",
            port: 5173,
        },
    };
});
