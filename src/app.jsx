import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Login } from "./login/login";
import { Play } from "./play/play";
import { Friends } from "./friends/friends";
import { WinLoss } from "./win-loss/win-loss";

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <header className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0 mt-0">Tic-Tac-Toe</h1>

          <nav>
            <menu className="d-flex gap-3 mb-0">
              <li>
                <NavLink className="nav-link text-white p-0" to="/">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link text-white p-0" to="/play">
                  Play
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link text-white p-0" to="/friends">
                  Friends
                </NavLink>
              </li>
              <li>
                <NavLink className="nav-link text-white p-0" to="/win-loss">
                  Win-Loss
                </NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Login />} exact />
          <Route path="/play" element={<Play />} />
          <Route path="/win-loss" element={<WinLoss />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

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
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
