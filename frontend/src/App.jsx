import { useMemo, useState } from "react";
import Web3 from "web3";

import tokenJson from "./abi/GameAsset1155.json";
import regJson from "./abi/MetadataRegistry.json";
import "./App.css";

const REGISTRY_ADDRESS = "0x316955828D5e69eD7b172a5Dc5E433b7B3316544";
const TOKEN_ADDRESS    = "0x0cD5bFC71afCB7e729f24Cc7442a9d6746C89FD9";
const BACKEND_BASE     = "http://localhost:5000";
const isProd =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";
const GANACHE_CHAIN_ID_HEX = "0x539"; 

export default function App() {
  const [account, setAccount] = useState("-");
  const [chainId, setChainId] = useState("-");
  const [web3, setWeb3] = useState(null);

  const [tokenId, setTokenId] = useState(1);
  const [amount, setAmount] = useState(1);

  const [name, setName] = useState("Iron Sword");
  const [description, setDescription] = useState("Basic sword for beginners players");
  const [imageUrl, setImageUrl] = useState("/images/iron-sword.png");
  const [rarity, setRarity] = useState("common");
  const [attack, setAttack] = useState(10);

  const [balance, setBalance] = useState("-");
  const [tokenUri, setTokenUri] = useState("-");
  const [meta, setMeta] = useState(null);

  const tokenContract = useMemo(() => {
    if (!web3) return null;
    return new web3.eth.Contract(tokenJson.abi, TOKEN_ADDRESS);
  }, [web3]);

  const regContract = useMemo(() => {
    if (!web3) return null;
    return new web3.eth.Contract(regJson.abi, REGISTRY_ADDRESS);
  }, [web3]);

  const requireGanache = async () => {
  const current = await window.ethereum.request({ method: "eth_chainId" });
  setChainId(current);

  // Ganache bisa 1337 (0x539) atau 5777 (0x1691)
  const allowed = new Set(["0x539", "0x1691"]);
  if (allowed.has(current)) return true;

  // coba switch ke 1337 dulu (yang paling umum kamu pakai sekarang)
  const preferred = "0x539";

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: preferred }],
    });
    const after = await window.ethereum.request({ method: "eth_chainId" });
    setChainId(after);
    return allowed.has(after);
  } catch (e) {
    // kalau belum ada networknya, add
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: preferred,
            chainName: "Ganache Local",
            rpcUrls: ["http://127.0.0.1:7545"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          },
        ],
      });
      const after = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(after);
      return allowed.has(after);
    } catch (e2) {
      console.error(e2);
      alert("Network MetaMask belum ke Ganache (RPC http://127.0.0.1:7545, chainId 1337/5777).");
      return false;
    }
  }
};


  const connect = async () => {
    try {
      if (!window.ethereum) return alert("MetaMask tidak terdeteksi");

      if (isProd) {
  alert("Portfolio mode: Connect/tx on-chain hanya tersedia saat demo lokal (Ganache).");
  return;
}

      // penting: cek network dulu
      const ok = await requireGanache();
      if (!ok) return;

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const w3 = new Web3(window.ethereum);

      const accounts = await w3.eth.getAccounts();
      setAccount(accounts[0]);
      setWeb3(w3);

      // sanity check contract exists
      const code = await w3.eth.getCode(TOKEN_ADDRESS);
      if (code === "0x") {
        alert("TOKEN_ADDRESS tidak ada contract. Salah address atau salah workspace Ganache.");
        return;
      }
      const code2 = await w3.eth.getCode(REGISTRY_ADDRESS);
      if (code2 === "0x") {
        alert("REGISTRY_ADDRESS tidak ada contract. Salah address atau salah workspace Ganache.");
        return;
      }

      alert("Connect sukses ✅");
    } catch (e) {
      console.error(e);
      alert("Connect gagal. Cek console.");
    }
  };

  const loadToken = async () => {
  try {
    // PORTFOLIO MODE (Vercel): load metadata dari public folder
    if (isProd) {
      const u = `${location.origin}/metadata/${tokenId}.json`;
      setTokenUri(u);

      const res = await fetch(u);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} dari ${u}\n${txt.slice(0, 200)}`);
      }

      const json = await res.json();
      setMeta(json);
      setBalance("-");
      return;
    }

    // LOCAL MODE (on-chain)
    if (!tokenContract || account === "-") return;

    const bal = await tokenContract.methods.balanceOf(account, tokenId).call();
    setBalance(String(bal));

    const u = await tokenContract.methods.uri(tokenId).call();
    setTokenUri(u || "-");

    if (!u) {
      setMeta(null);
      return;
    }

    const res = await fetch(u);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} dari ${u}\n${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    setMeta(json);
  } catch (e) {
    console.error("loadToken error:", e);
    alert("Load token gagal. Cek console.");
  }
};

  const submitProduct = async () => {
  try {
    // PORTFOLIO MODE (Vercel): jangan transaksi on-chain
    if (isProd) {
      alert(
        "Portfolio mode: fitur on-chain (setURI + mint) hanya tersedia saat demo lokal.\n\n" +
        "Untuk demo full: jalankan Ganache + backend + frontend di localhost."
      );
      return;
    }

    // LOCAL MODE (full)
    if (!tokenContract || !regContract || account === "-") {
      alert("Connect MetaMask dulu.");
      return;
    }

    const payload = {
      name,
      description,
      image: imageUrl,
      attribute: [
        { trait_type: "rarity", value: rarity },
        { trait_type: "attack", value: Number(attack) },
      ],
    };

    const res = await fetch(`${BACKEND_BASE}/api/metadata/${tokenId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gagal simpan metadata di backend. (${res.status}) ${txt}`);
    }

    const out = await res.json();
    const url = out.url; // http://localhost:5000/metadata/1.json

    await regContract.methods.setURI(tokenId, url).send({ from: account });
    await tokenContract.methods.mint(account, tokenId, amount, "0x").send({ from: account });

    alert(`Submit sukses ✅\nURI: ${url}`);
    await loadToken();
  } catch (e) {
    console.error("submitProduct error:", e);
    alert(String(e.message || e));
  }
};

  const prettyJson = meta ? JSON.stringify(meta, null, 2) : "{}";
  const previewImg = meta?.image || "";

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>Decentralized Game Assets</h1>
          <div className="subtitle">User input → MetaMask tx → Ganache on-chain ✅</div>
        </div>

        <div className="actions">
          <button className="btn" onClick={connect}>Connect MetaMask</button>
          <button
  className="btn"
  onClick={loadToken}
  disabled={isProd ? false : (!tokenContract || account === "-")}
>
  Load Token
</button>
        </div>
      </header>

      <div className="grid">
        <section className="card">
          <h2>Create Product (Input User)</h2>

          <div className="row">
            <div className="field">
              <label>Token ID</label>
              <input value={tokenId} onChange={(e) => setTokenId(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Amount (Mint)</label>
              <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="field">
            <label>Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <div className="hint">Pastikan bisa dibuka: {imageUrl}</div>
          </div>

          <div className="row">
            <div className="field">
              <label>Rarity</label>
              <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
                <option value="common">common</option>
                <option value="rare">rare</option>
                <option value="epic">epic</option>
                <option value="legendary">legendary</option>
              </select>
            </div>
            <div className="field">
              <label>Attack</label>
              <input value={attack} onChange={(e) => setAttack(Number(e.target.value))} />
            </div>
          </div>

          <button className="btn primary" onClick={submitProduct}>
            Submit Product (setURI + mint)
          </button>

          <hr className="sep" />

          <h3>Status</h3>
          <div className="kv"><b>Chain ID:</b> {chainId}</div>
          <div className="kv"><b>Account:</b> {account}</div>
          <div className="kv"><b>Token:</b> {TOKEN_ADDRESS}</div>
          <div className="kv"><b>Registry:</b> {REGISTRY_ADDRESS}</div>
          <div className="kv"><b>Balance:</b> {balance}</div>
          <div className="kv"><b>tokenURI:</b> {tokenUri}</div>
        </section>

        <section className="card">
          <h2>Preview</h2>
          <div className="preview">
            {previewImg ? (
              <img src={previewImg} alt="preview" />
            ) : (
              <div className="empty">Belum ada image (load token / submit dulu)</div>
            )}

            <div className="ptext">
              <div className="ptitle">{meta?.name || "-"}</div>
              <div className="pdesc">{meta?.description || "-"}</div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Metadata JSON</h2>
          <pre className="json">{prettyJson}</pre>
        </section>
      </div>
    </div>
  );
}