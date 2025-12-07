import { useState } from "react";
import "./UsernameInput.css";

export default function UsernameInput({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    onSubmit({ username, password });
  };

  return (
    <form className="username-form" onSubmit={handleSubmit}>
      <h1>Welcome to Car Tinder!</h1>
      <label className="username-label">Username</label>
      <input
        type="text"
        className="username-input"
        value={username}
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="username-label">Password</label>
      <input
        type="password"
        className="username-input"
        value={password}
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className="username-button">
        Continue
      </button>
    </form>
  );
}
