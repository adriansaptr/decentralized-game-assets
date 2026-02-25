# Decentralized Game Assets (ERC-1155) — Off-chain Metadata Architecture

A full-stack Web3 dApp that demonstrates **decentralized ownership of in-game assets** using **ERC-1155** on-chain ownership and **off-chain metadata** served via a backend API.  
This project separates **immutable token logic** from **updatable metadata**, making it more scalable for game items.

---

## ✨ Key Features
- **ERC-1155** minting for semi-fungible / stackable game items
- **MetadataRegistry** contract to map `tokenId → tokenURI`
- **Off-chain metadata** stored as JSON (backend) + image hosting
- **MetaMask integration** for transaction signing
- End-to-end flow: **User input → Save metadata → setURI → Mint → Preview**

---

## 🎥 Demo
- Video: (https://drive.google.com/file/d/1KPmuKrv6j3nj76e4QBtm8l_0McTFce3t/view?usp=sharing)

---

## 🧠 Architecture Overview
**Why separate metadata from token logic?**  
On-chain storage is expensive and less flexible for frequent metadata updates (image/attributes).  
This architecture keeps ownership immutable on-chain while serving metadata off-chain.

**High-level flow:**
User → Frontend (React/Vite) → MetaMask → Smart Contracts (Ganache)
                         ↓
                    Backend (Express) → JSON Metadata + Images

---

## 🧰 Tech Stack
- **Solidity** (ERC-1155 + Metadata Registry)
- **Truffle** (compile & deploy)
- **Ganache** (local blockchain)
- **Node.js + Express** (metadata API + static hosting)
- **React + Vite** (frontend)
- **Web3.js** (contract calls)
- **MetaMask** (wallet & signing)

---

## 📁 Project Structure


---

## 🚀 Getting Started (Local)

### 1) Start Ganache
Run Ganache GUI and ensure:
- RPC: `http://127.0.0.1:7545`
- Chain ID: `1337` (common in Ganache)
- Accounts funded with test ETH

### 2) Deploy Smart Contracts
```bash
cd truffle
truffle migrate --reset

Copy deployed addresses from the migration output and update frontend:

TOKEN_ADDRESS (GameAsset1155)

REGISTRY_ADDRESS (MetadataRegistry)

File: frontend/src/App.jsx

### 3) Run Backend (Express)

cd backend
npm install
node server.js

Backend should run at:

http://localhost:5000

Quick tests:

http://localhost:5000/metadata/1.json

http://localhost:5000/images/iron-sword.png

### 4) Run Frontend (Vite)

cd frontend
npm install
npm run dev

Open:

http://127.0.0.1:5173

### 5) Connect Metamask

Add Ganache network in MetaMask:

RPC: http://127.0.0.1:7545

Chain ID: 1337

Import a Ganache account private key to MetaMask (for test ETH).


⚙️ Configuration Notes

Ganache chain ID may differ depending on version, but this project expects 1337.

Backend base URL is configured in frontend:

BACKEND_BASE = "http://localhost:5000"

🧯 Troubleshooting

1) “InvalidAddressError”

Ensure you copied the contract address correctly (must be 42 chars, starts with 0x)

Ensure no extra characters at the end

2) MetaMask “Review alert” locked

Use correct network (Ganache)

Ensure account has test ETH (import Ganache private key)

3) tokenURI loads but image doesn’t show

Make sure image URL is accessible directly in browser:

http://localhost:5000/images/...

📌 Future Improvements

IPFS/Arweave storage for metadata (more decentralized)

Deploy smart contracts to Sepolia testnet

Add marketplace / trading module

Gas optimization & batch minting

📄 License

MIT (optional)

👤 Author

Adrian Saputra

GitHub: https://github.com/adriansaptr
