import React from "react";
import "./friends.css";
import { useState } from "react";

export function Friends() {
  const [invite, setInvite] = useState("");

  function friendClick(e) {
    const friendName = e.currentTarget.textContent;
    setInvite(`inviting ${friendName} to play...`);
  }

  return (
    <main className="container my-4">
      <form
        id="searchfriends"
        method="get"
        className="d-flex flex-column align-items-center mb-4"
      >
        <label htmlFor="friends-username" className="mb-2 text-white fw-bold">
          Search friends:
        </label>

        <input
          type="text"
          id="friends-username"
          name="friendsUsername"
          className="form-control mb-2 w-50"
        />

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <section className="text-center mb-4">
        <h2 className="mb-2">Friends Service (3rd-party API Placeholder)</h2>
        <p className="text-white">
          This data will be loaded from a 3rd-party REST API (e.g., friends
          service).
        </p>
        <p className="text-white"> {invite}</p>
      </section>

      <div className="table-responsive">
        <table
          id="friendstable"
          className="table table-dark table-striped text-center"
        >
          <thead className="table-dark">
            <tr>
              <th id="tableheader">Select friends name to send invite:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <button
                  onClick={friendClick}
                  id="friend1"
                  type="button"
                  className="btn btn-secondary w-100 mb-2"
                >
                  You
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={friendClick}
                  id="friend2"
                  type="button"
                  className="btn btn-secondary w-100 mb-2"
                >
                  Yourself
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={friendClick}
                  id="friend3"
                  type="button"
                  className="btn btn-secondary w-100 mb-2"
                >
                  Thyself
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={friendClick}
                  id="friend4"
                  type="button"
                  className="btn btn-secondary w-100 mb-2"
                >
                  Not me
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
