import React from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser's normal form navigation
    navigate("/play"); // go to the Play route
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
        />

        <div className="d-flex gap-3">
          <button id="login" type="submit" className="btn btn-primary">
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
