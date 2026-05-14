const RAILWAY_WEBHOOK =
  process.env.N8N_WEBHOOK_URL ||
  "https://agente-copago-ia-production.up.railway.app/webhook/agente-copago";

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  const allowOrigin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  try {
    const upstream = await fetch(RAILWAY_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error("copago proxy:", error);
    return res.status(502).json({ error: "Upstream error" });
  }
};
