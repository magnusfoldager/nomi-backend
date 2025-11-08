import OpenAI from "openai";

const ACI_MCP: OpenAI.Responses.Tool = {
  type: "mcp",
  require_approval: "never",
  server_url: process.env["ACI_MCP_URL"],
  server_label: "ACTIONS",
};

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export default client;
export { ACI_MCP };
