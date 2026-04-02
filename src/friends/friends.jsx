import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../useWebSocket";
import "./friends.css";

export function Friends() {
  const [invite, setInvite] = useState("");
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [gameInvites, setGameInvites] = useState([]);
  const navigate = useNavigate();
  const { send, on, connected } = useWebSocket();

  useEffect(() => {
    const offInvite = on("game_invite", (msg) => {
      setGameInvites((prev) => {
        if (prev.some((i) => i.from === msg.from)) return prev;
        return [...prev, { from: msg.from }];
      });
    });

    const offReject = on("invite_rejected", (msg) => {
      setInvite(`${msg.from} declined your invite.`);
    });

    const offStart = on("game_start", (msg) => {
      navigate(
        `/play?room=${msg.roomId}&opponent=${msg.opponent}&mark=${msg.mark}`,
      );
    });

    return () => {
      offInvite();
      offReject();
      offStart();
    };
  }, [on, navigate]);

  useEffect(() => {
    fetch("/api/friends/requests", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setPendingRequests)
      .catch(() => {});
  }, []);

  function sendGameInvite(toUsername) {
    send({ type: "game_invite", to: toUsername });
    setInvite(`Invite sent to ${toUsername}, waiting...`);
  }

  function acceptGameInvite(fromUsername) {
    send({ type: "invite_accept", to: fromUsername });
    setGameInvites((prev) => prev.filter((i) => i.from !== fromUsername));
  }

  function rejectGameInvite(fromUsername) {
    send({ type: "invite_reject", to: fromUsername });
    setGameInvites((prev) => prev.filter((i) => i.from !== fromUsername));
  }

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

  async function acceptRequest(fromUsername) {
    const res = await fetch("/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ from: fromUsername }),
    });
    if (res.ok) {
      setPendingRequests((prev) => prev.filter((u) => u !== fromUsername));
      setInvite(`You and ${fromUsername} are now friends!`);
    }
  }

  async function rejectRequest(fromUsername) {
    const res = await fetch("/api/friends/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ from: fromUsername }),
    });
    if (res.ok) {
      setPendingRequests((prev) => prev.filter((u) => u !== fromUsername));
    }
  }

  return (
    <main className="container my-4">
      {!connected && (
        <p className="text-danger text-center">WebSocket disconnected</p>
      )}

      {gameInvites.length > 0 && (
        <div className="mb-4">
          <h5 className="text-white text-center">Game Invites</h5>
          {gameInvites.map((inv) => (
            <div
              key={inv.from}
              className="d-flex align-items-center justify-content-center gap-2 mb-2"
            >
              <span className="text-white">{inv.from} wants to play!</span>
              <button
                className="btn btn-success btn-sm"
                onClick={() => acceptGameInvite(inv.from)}
              >
                Play
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => rejectGameInvite(inv.from)}
              >
                Decline
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <h5 className="text-white text-center">Pending Friend Requests</h5>
          {pendingRequests.map((username) => (
            <div
              key={username}
              className="d-flex align-items-center justify-content-center gap-2 mb-2"
            >
              <span className="text-white">{username}</span>
              <button
                className="btn btn-success btn-sm"
                onClick={() => acceptRequest(username)}
              >
                Accept
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => rejectRequest(username)}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

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
                      onClick={() => sendRequest(username)}
                      type="button"
                      className="btn btn-success ms-3"
                    >
                      Add Friend
                    </button>
                    <button
                      onClick={() => sendGameInvite(username)}
                      type="button"
                      className="btn btn-warning ms-2"
                    >
                      Invite to Play
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
