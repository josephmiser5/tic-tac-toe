import React, { useState } from "react";
import "./friends.css";

export function Friends() {
  const [invite, setInvite] = useState("");
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(
      `/api/users/search?q=${encodeURIComponent(query)}`,
      { credentials: "include" },
    );
    if (res.ok) {
      const data = await res.json();
      setFriends(data.map((u) => u.username));
    }
  }

  async function sendRequest(friendUsername) {
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ to: friendUsername }),
    });
    if (res.ok) {
      setInvite(`Friend request sent to ${friendUsername}!`);
    } else {
      const data = await res.json();
      setInvite(data.error || "Failed to send request");
    }
  }

  return (
    <main className="container my-4">
      <form
        id="searchfriends"
        onSubmit={handleSearch}
        className="d-flex flex-column align-items-center mb-4"
      >
        <label htmlFor="friends-username" className="mb-2 text-white fw-bold">
          Search friends:
        </label>
        <input
          type="text"
          id="friends-username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control mb-2 w-50"
        />
        <button type="submit" className="btn btn-primary">
          search
        </button>
      </form>

      <section className="text-center mb-4">
        {invite && <p className="text-warning fw-bold">{invite}</p>}
      </section>

      {friends.length > 0 && (
        <div className="table-responsive">
          <table
            id="friendstable"
            className="table table-dark table-striped text-center"
          >
            <thead className="table-dark">
              <tr>
                <th>Select a friend to send invite:</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((username, index) => (
                <tr key={index}>
                  <td>
                    <span className="text-white">{username}</span>
                    <button
                      onClick={() => addFriend(username)}
                      type="button"
                      className="btn btn-success ms-3"
                    >
                      Add Friend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
