import React from "react";
import "./win-loss.css";

export function WinLoss() {
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
              <th>User</th>
              <th>Win-Loss</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Not-me</td>
              <td>Win</td>
              <td>1:0</td>
            </tr>
            <tr>
              <td>Thyself</td>
              <td>Loss</td>
              <td>1:2</td>
            </tr>
            <tr>
              <td>Not-me</td>
              <td>Win</td>
              <td>1:0</td>
            </tr>
            <tr>
              <td>Thyself</td>
              <td>Loss</td>
              <td>1:2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
