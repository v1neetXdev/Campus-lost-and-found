import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { api, clearAuth, getToken, getUser, setAuth } from "./api.js";
import { TbHomeSearch } from "react-icons/tb";
import { TbSun, TbMoon } from "react-icons/tb";


const CATS = ["electronics", "documents", "books", "clothing", "accessories", "keys", "other"];

/* ---------- reusable Tailwind class strings ---------- */
const input =
  "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30";
const btn =
  "inline-flex cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 active:scale-95";
const btnSm =
  "cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95";
const panel =
  "mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm";
const muted = "text-sm text-slate-500 dark:text-slate-400";
const wrap = "mx-auto max-w-6xl px-4 py-6";
const wrapNarrow = "mx-auto max-w-lg px-4 py-6";
const link = "font-medium text-indigo-600 dark:text-indigo-400 hover:underline";

function Badge({ kind, children }) {
  const colors = {
    lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    found: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    gray: "border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colors[kind]}`}>{children}</span>;
}

function Navbar() {
  const nav = useNavigate();
  const user = getUser();
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
const toggleTheme = () => {
  const next = !dark;
  setDark(next);
  document.documentElement.classList.toggle("dark", next);
  localStorage.theme = next ? "dark" : "light";
};
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-6 py-3.5 backdrop-blur">
      <Link to="/" className="text-lg font-bold text-slate-900 dark:text-white"><TbHomeSearch className="text-2xl text-indigo-600 flex flex-wrap justify-between" /> Campus Lost &amp; Found</Link>
      <nav className="flex items-center gap-5 text-sm">
        <Link to="/" className={link}>Browse</Link>
        {getToken() ? (<>
          <Link to="/report" className={link}>Report Item</Link>
          <Link to="/dashboard" className={link}>My Dashboard</Link>
          <button className="cursor-pointer font-medium text-slate-600 dark:text-slate-300 hover:text-red-600" onClick={() => { clearAuth(); nav("/"); }}>
            Logout ({user})
          </button>
        </>) : <Link to="/login" className={btnSm}>Login</Link>}
        <button
  onClick={toggleTheme}
  aria-label="Toggle theme"
  className="cursor-pointer rounded-full p-2 text-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
>
  {dark ? <TbSun /> : <TbMoon />}
</button>
      </nav>
    </header>
  );
}

function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-40 items-center justify-center bg-slate-100 dark:bg-slate-700 text-5xl">
        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : <span>📦</span>}
      </div>
      <div className="p-4">
        <div className="flex gap-1.5"><Badge kind={item.item_type}>{item.item_type}</Badge><Badge kind="gray">{item.status}</Badge></div>
        <h3 className="mt-2 mb-1 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
        <p className={muted}>📍 {item.location} · 📅 {item.date}</p>
      </div>
    </Link>
  );
}

function Home() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ q: "", type: "", category: "" });
  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
    api(`/items/?${qs}`).then(setItems).catch(() => setItems([]));
  }, [f]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className={wrap}>
      <section className="py-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">Lost something on campus?</h1>
        <p className="text-slate-500 dark:text-slate-400">Search reported items or post what you found — help it reach its owner.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <input className={`${input} sm:w-72`} placeholder="Search title, place, description…" value={f.q} onChange={set("q")} />
          <select className={`${input} sm:w-44`} value={f.type} onChange={set("type")}>
            <option value="">Lost &amp; Found</option><option value="lost">Lost</option><option value="found">Found</option>
          </select>
          <select className={`${input} sm:w-48 capitalize`} value={f.category} onChange={set("category")}>
            <option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </section>
      {items.length === 0
        ? <p className={`${muted} text-center`}>No items found.</p>
        : <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">{items.map((i) => <ItemCard key={i.id} item={i} />)}</div>}
    </div>
  );
}

function Auth({ mode }) {
  const nav = useNavigate();
  const [v, setV] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api(`/auth/${mode}/`, { method: "POST", body: v });
      setAuth(d.token, d.username || v.username);
      nav("/");
    } catch (x) { setErr(x.message); }
  };
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <div className={wrapNarrow}>
      <form className={panel} onSubmit={submit}>
        <h2 className="text-2xl font-bold">{mode === "login" ? "Login" : "Create account"}</h2>
        {err && <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-300">{err}</p>}
        <input className={input} placeholder="Username" value={v.username} onChange={set("username")} required />
        {mode === "register" && <input className={input} type="email" placeholder="College email" value={v.email} onChange={set("email")} />}
        <input className={input} type="password" placeholder="Password" value={v.password} onChange={set("password")} required />
        <button className={btn}>{mode === "login" ? "Login" : "Register"}</button>
        <p className={muted}>{mode === "login" ? <>New here? <Link className={link} to="/register">Register</Link></> : <>Have an account? <Link className={link} to="/login">Login</Link></>}</p>
      </form>
    </div>
  );
}

function Report() {
  const nav = useNavigate();
  const [v, setV] = useState({ item_type: "lost", title: "", description: "", category: "other", location: "", date: new Date().toISOString().slice(0, 10), contact: "" });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(v).forEach(([k, val]) => form.append(k, val));
    if (file) form.append("image", file);
    try { const d = await api("/items/", { method: "POST", form }); nav(`/items/${d.id}`); } catch (x) { setErr(x.message); }
  };
  if (!getToken()) return <Navigate to="/login" />;
  return (
    <div className={wrapNarrow}>
      <form className={panel} onSubmit={submit}>
        <h2 className="text-2xl font-bold">Report an item</h2>
        {err && <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-300">{err}</p>}
        <select className={input} value={v.item_type} onChange={set("item_type")}>
          <option value="lost">I lost something</option><option value="found">I found something</option>
        </select>
        <input className={input} placeholder="Title (e.g. Black wallet)" value={v.title} onChange={set("title")} required />
        <textarea className={input} rows="3" placeholder="Description (colour, brand, marks…)" value={v.description} onChange={set("description")} />
        <select className={`${input} capitalize`} value={v.category} onChange={set("category")}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <input className={input} placeholder="Location (e.g. Library, Canteen)" value={v.location} onChange={set("location")} required />
        <input className={input} type="date" value={v.date} onChange={set("date")} required />
        <input className={input} placeholder="Contact (optional phone)" value={v.contact} onChange={set("contact")} />
        <input className={`${input} file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:font-medium file:text-indigo-700`} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button className={btn}>Submit</button>
      </form>
    </div>
  );
}

function Detail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState("");
  const load = async () => {
    const it = await api(`/items/${id}/`);
    setItem(it);
    if (it.is_owner) setClaims(await api(`/claims/?item=${id}`));
  };
  useEffect(() => { load().catch(() => {}); }, [id]);
  if (!item) return <div className={wrap}>Loading…</div>;
  const claim = async (e) => {
    e.preventDefault();
    try { await api("/claims/", { method: "POST", body: { item: item.id, message: msg } }); setInfo("Claim sent to the poster ✅"); setMsg(""); } catch (x) { setInfo(x.message); }
  };
  const decide = async (cid, decision) => { await api(`/claims/${cid}/decide/`, { method: "POST", body: { decision } }); load(); };
  const resolve = async () => { await api(`/items/${id}/resolve/`, { method: "POST" }); load(); };
  return (
    <div className={wrap}>
      <div className={`${panel} flex-row flex-wrap gap-6`}>
        {item.image && <img src={item.image} alt="" className="w-80 max-w-full rounded-xl object-cover" />}
        <div className="min-w-60 flex-1 space-y-2">
          <div className="flex gap-1.5"><Badge kind={item.item_type}>{item.item_type}</Badge><Badge kind="gray">{item.status}</Badge></div>
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <p>{item.description || "No description."}</p>
          <p className={muted}>📍 {item.location} · 📅 {item.date} · 🏷️ {item.category}</p>
          <p className={muted}>Posted by {item.reporter_name}{item.contact && ` · 📞 ${item.contact}`}</p>
          {item.is_owner && item.status !== "resolved" && <button className={btn} onClick={resolve}>Mark as resolved</button>}
        </div>
      </div>
      {!item.is_owner && getToken() && item.status === "open" && (
        <form className={panel} onSubmit={claim}>
          <h3 className="text-lg font-semibold">{item.item_type === "found" ? "This is mine — claim it" : "I found this — contact owner"}</h3>
          <textarea className={input} rows="3" placeholder="Describe proof / details only the owner would know" value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <button className={btn}>Send</button>{info && <p className={muted}>{info}</p>}
        </form>
      )}
      {!getToken() && <p className={muted}><Link className={link} to="/login">Login</Link> to claim this item.</p>}
      {item.is_owner && (
        <div className={panel}><h3 className="text-lg font-semibold">Claims received</h3>
          {claims.length === 0 && <p className={muted}>No claims yet.</p>}
          {claims.map((c) => (
            <div key={c.id} className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex items-center gap-2"><b>{c.claimant_name}</b><Badge kind="gray">{c.status}</Badge></div>
              <p>{c.message}</p>
              {c.status === "pending" && <div className="flex gap-2">
                <button className={btnSm} onClick={() => decide(c.id, "approved")}>Approve</button>
                <button className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95" onClick={() => decide(c.id, "rejected")}>Reject</button>
              </div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [mine, setMine] = useState([]);
  const [claims, setClaims] = useState([]);
  useEffect(() => { api("/items/?mine=1").then(setMine); api("/claims/").then(setClaims); }, []);
  if (!getToken()) return <Navigate to="/login" />;
  return (
    <div className={wrap}>
      <h2 className="mb-4 text-2xl font-bold">My posts</h2>
      {mine.length === 0
        ? <p className={`${muted} mb-6`}>You haven't posted anything yet.</p>
        : <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">{mine.map((i) => <ItemCard key={i.id} item={i} />)}</div>}
      <h2 className="mb-4 text-2xl font-bold">Claims</h2>
      <div className={panel}>{claims.length === 0 && <p className={muted}>No claims.</p>}
        {claims.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700 pt-3 first:border-0 first:pt-0">
            <Link className={link} to={`/items/${c.item}`}>{c.item_title}</Link> — {c.claimant_name} <Badge kind="gray">{c.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 antialiased">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/report" element={<Report />} />
        <Route path="/items/:id" element={<Detail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}