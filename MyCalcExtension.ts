import {
  verifyAndParseRequest,
  getUserMessage,
  createTextEvent,
  createDoneEvent,
  type CopilotRequestPayload
} from "@copilot-extensions/preview-sdk";
import { createServer, IncomingMessage, ServerResponse } from "http";

// Simple calculator logic
function calculate(expression: string): string {
  try {
    // Very basic eval, for demo purposes only
    // In production, use a proper math parser!
    // Remove any non-math characters for basic security
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    // eslint-disable-next-line no-eval
    const result = eval(sanitized);
    return result.toString();
  } catch {
    return "Invalid expression";
  }
}

// Handler for Copilot Extension requests
async function handleCopilotRequest(req: IncomingMessage, res: ServerResponse) {
  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "Calculator Copilot Extension" }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const signature = req.headers["x-hub-signature-256"] as string;
      const keyId = req.headers["x-github-public-key-identifier"] as string;

      if (!signature || !keyId) {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Missing signature or key ID");
        return;
      }

      // Verify and parse the request
      const { isValidRequest, payload } = await verifyAndParseRequest(
        body,
        signature,
        keyId
      );

      if (!isValidRequest) {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Invalid signature");
        return;
      }

      // Get the user's message
      const userMessage = getUserMessage(payload);
      
      if (!userMessage) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write(createTextEvent("Please provide a math expression to calculate."));
        res.write(createDoneEvent());
        res.end();
        return;
      }

      // Calculate the result
      const result = calculate(userMessage);

      // Send the response
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(createTextEvent(`Calculation: ${userMessage}\nResult: ${result}`));
      res.write(createDoneEvent());
      res.end();

    } catch (error) {
      console.error("Error processing request:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
}

// Create and start the server
const server = createServer(handleCopilotRequest);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Calculator Copilot Extension running on port ${PORT}`);
  console.log("Ready to handle calculation requests!");
});

export default server;