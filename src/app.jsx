import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

export default function App() {
  return (
    <div className="app bg-dark text-light">
      <header className="d-flex justify-content-between align-items-center">
        <h1 className="mb-0 mt-0">Tic-Tac-Toe</h1>

        <nav>
          <menu className="d-flex gap-3 mb-0">
            <li>
              <a className="nav-link text-white p-0" href="index.html">
                Home
              </a>
            </li>
            <li>
              <a className="nav-link text-white p-0" href="play.html">
                Play
              </a>
            </li>
            <li>
              <a className="nav-link text-white p-0" href="friends.html">
                Friends
              </a>
            </li>
            <li>
              <a className="nav-link text-white p-0" href="win-loss.html">
                Win-Loss
              </a>
            </li>
          </menu>
        </nav>
      </header>
      <main>App component will be displayed here</main>
      <footer className="text-center">
        <hr />
        <span className="text-reset">Joseph Miser</span>
        <a
          className="text-white ms-3"
          href="https://github.com/josephmiser5/tic-tac-toe"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
