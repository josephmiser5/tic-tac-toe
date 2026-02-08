import React from "react";

export function Login() {
  return (
    <main className="text-center mt-4">
      <h2>Login and Start Having Fun</h2>

      <form
        method="get"
        action="play.html"
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
