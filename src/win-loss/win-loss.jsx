import React, { useState, useEffect } from "react";
import "./win-loss.css";

export function WinLoss() {
  const [stats, setStats] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/game/history", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then(setGameHistory)
      .catch(() => setGameHistory([]));
  }, []);
  return (
    <main className="container my-4 text-center">
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
