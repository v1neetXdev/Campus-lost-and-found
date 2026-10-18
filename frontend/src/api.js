export const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
export const getToken = () => localStorage.getItem("token");
export const getUser = () => localStorage.getItem("username");
export const setAuth = (token, username) => { localStorage.setItem("token", token); localStorage.setItem("username", username); };
export const clearAuth = () => { localStorage.removeItem("token"); localStorage.removeItem("username"); };

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  if (getToken()) headers.Authorization = `Token ${getToken()}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data ? Object.values(data).flat().join(" ") : "Something went wrong";
    throw new Error(msg);
  }
  return data;
}
