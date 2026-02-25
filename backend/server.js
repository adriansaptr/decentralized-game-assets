// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve static files
app.use("/metadata", express.static(path.join(__dirname, "metadata")));
app.use("/images", express.static(path.join(__dirname, "images")));

// health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// POST metadata -> save file to backend/metadata/<id>.json
app.post("/api/metadata/:id", (req, res) => {
  try {
    const id = String(req.params.id);
    const outDir = path.join(__dirname, "metadata");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const filePath = path.join(outDir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), "utf-8");

    // return the public URL that frontend should store on-chain
    const url = `http://localhost:5000/metadata/${id}.json`;
    res.json({ ok: true, url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running: http://localhost:${PORT}`);
  console.log(`GET metadata example: http://localhost:${PORT}/metadata/1.json`);
});