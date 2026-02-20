import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login({ setUsername, setPass }) {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/play");
  }

  function loginUser() {
    localStorage.setItem("user", user);
    localStorage.setItem("password", password);
    setUsername(user);
    setPass(password);
  }

  function userChange(e) {
    setUser(e.target.value);
  }

  function passwordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <main className="text-center mt-4">
      <h2>Login and Start Having Fun</h2>

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-center mt-3"
      >
        <label id="usernamelabel" htmlFor="username">
          Username:
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="form-control mb-3 w-25"
          placeholder="Enter username"
          onChange={userChange}
        />

        <label id="passwordlabel" htmlFor="password">
          Password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control mb-3 w-25"
          placeholder="Enter password"
          onChange={passwordChange}
        />

        <div className="d-flex gap-3">
          <button
            id="login"
            onClick={loginUser}
            type="submit"
            className="btn btn-primary"
          >
            Login
          </button>
          <button id="create" type="button" className="btn btn-secondary">
            Create
          </button>
        </div>
      </form>
    </main>
  );
}
