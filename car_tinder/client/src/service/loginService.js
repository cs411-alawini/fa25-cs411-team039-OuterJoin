const API_BASE = import.meta.env.VITE_API_BASE;

class LoginService {
  static async login(username, password) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();

    if (!data.user_id) {
      throw new Error("Invalid response from server");
    }

    return data.user_id;
  }
}

export default LoginService;
