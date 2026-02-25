const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors()); // biar frontend (5173) boleh fetch
app.use(express.json());

// folder metadata & images
const METADATA_DIR = path.join(__dirname, "..", "metadata");
const IMAGES_DIR = path.join(__dirname, "..", "images"); // kalau images ada di root
// Kalau images kamu ada di backend/images, ganti ke path.join(__dirname, "images")

// pastikan folder metadata ada
if (!fs.existsSync(METADATA_DIR)) fs.mkdirSync(METADATA_DIR, { recursive: true });

// serve static
app.use("/metadata", express.static(METADATA_DIR));
app.use("/images", express.static(IMAGES_DIR));

// ✅ endpoint buat metadata dari input user
app.post("/metadata", (req, res) => {
  try {
    const { tokenId, name, description, image, rarity, attack } = req.body;

    if (tokenId === undefined || tokenId === null) {
      return res.status(400).json({ error: "tokenId wajib" });
    }

    const id = Number(tokenId);
    if (Number.isNaN(id) || id < 0) {
      return res.status(400).json({ error: "tokenId tidak valid" });
    }

    const json = {
      name: name || `Item #${id}`,
      description: description || "",
      image: image || "",
      attributes: [
        { trait_type: "rarity", value: rarity || "common" },
        { trait_type: "attack", value: Number(attack ?? 0) },
      ],
    };

    const filename = `${id}.json`;
    const filePath = path.join(METADATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");

    const url = `http://localhost:5000/metadata/${filename}`;
    return res.json({ ok: true, url, json });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend OK. Use /metadata and /images");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running http://localhost:${PORT}`));