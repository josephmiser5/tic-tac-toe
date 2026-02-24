import React from "react";
import "./win-loss.css";
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored != null) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]); // persist pattern [web:2]

  const setValue = (valueOrUpdater) => {
    setState((prev) =>
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(prev)
        : valueOrUpdater,
    );
  };

  return [state, setValue];
}

export function WinLoss() {
  const [gameHistory] = useLocalStorage("gameHistory", []);

  return (
    <main className="container my-4 text-center">
      <section className="mb-4">
        <h2>Win-Loss Service (3rd-party API Placeholder)</h2>
        <p>This data will be loaded from a 3rd-party REST API.</p>
      </section>

      <section className="mb-4">
        <h2>Stored Game History</h2>
        <p>
          The following data will be retrieved from the application database.
        </p>
      </section>

      <div className="table-responsive">
        <table className="table table-dark table-striped text-center">
          <thead className="table-secondary text-dark">
            <tr>
              <th>Playing against</th>
              <th>Win-Loss</th>
              <th>Score X:O</th>
            </tr>
          </thead>
          <tbody>
            {gameHistory.length === 0 ? (
              <tr>
                <td colSpan={3}>No games yet</td>
              </tr>
            ) : (
              gameHistory.map((row, i) => (
                <tr key={row.createdAt ?? i}>
                  <td>{row.user}</td>
                  <td>{row.result}</td>
                  <td>{row.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
