import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function Login({ setUsername }) {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e?.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    localStorage.setItem("username", data.username);
    setUsername(data.username);
    navigate("/play");
  }

  async function handleCreate() {
    if (!user || !password) return setError("Fill in both fields");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);
    await handleLogin();
  }

  return (
    <main className="text-center mt-4">
      <h2>Login and Start Having Fun</h2>
      {error && <p className="text-danger">{error}</p>}
      <form
        onSubmit={handleLogin}
        className="d-flex flex-column align-items-center mt-3"
      >
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          className="form-control mb-3 w-25"
          placeholder="Enter username"
          onChange={(e) => setUser(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          className="form-control mb-3 w-25"
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="d-flex gap-3">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </form>
    </main>
  );
}
