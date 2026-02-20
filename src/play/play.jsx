import React from "react";
import "./play.css";
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);

    // Support lazy initializer functions
    const value =
      typeof initialValue === "function" ? initialValue() : initialValue;
    localStorage.setItem(key, JSON.stringify(value)); // ✅ persist on first creation
    return value;
  });

  const setValue = (value) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setValue];
}

export function Play() {
  const [numMoves, setNumMoves] = useLocalStorage("numMoves", 0);
  const [board, setBoard] = useLocalStorage("board", Array(9).fill(null));
  const [isx, setIsx] = useLocalStorage("isx", Math.random() < 0.5);
  const [startedAsX] = useLocalStorage("startedas", () => Math.random() < 0.5);
  const [winner, setWinner] = useState(null);
  const [user] = useState(localStorage.getItem("user"));

  function displayImage() {
    return startedAsX ? "orangeX.png" : "redO.png";
  }

  const handleClick = (index) => {
    if (winner || board[index]) return;

    const nextCells = [...board];
    const currentPlayer = isx ? "X" : "O";
    const nextMoves = numMoves + 1;

    nextCells[index] = currentPlayer;

    const WIN_CONDITIONS = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const hasWon = WIN_CONDITIONS.some(
      ([a, b, c]) =>
        nextCells[a] === currentPlayer &&
        nextCells[b] === currentPlayer &&
        nextCells[c] === currentPlayer,
    );

    if (hasWon) {
      setWinner(currentPlayer);
      alert(`${currentPlayer} wins`);
    } else if (nextMoves === 9) {
      alert("draw");
    }

    setBoard(nextCells);
    setNumMoves(nextMoves);
    setIsx(!isx);
  };

  function LiveActivity() {
    const [message, setMessage] = useState("");
    const users = ["Billy", "Bob", "Joe"];

    useEffect(() => {
      const interval = setInterval(() => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setMessage(`${randomUser} started a new game`);
      }, 5000);

      return () => clearInterval(interval); // cleanup on unmount
    }, []);

    return <p>{message}</p>;
  }

  return (
    <main className="container text-center my-4">
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
        <button id="bestof1" className="btn btn-success btn-lg">
          Best of 1
        </button>
        <button id="bestof2" className="btn btn-success btn-lg">
          Best of 2
        </button>
        <button id="bestof3" className="btn btn-success btn-lg">
          Best of 3
        </button>
      </div>
      <div
        id="usernamebox"
        className="html-box mx-auto mb-3 p-2 border rounded"
        style={{ width: "300px" }}
      >
        <p className="mb-0">&nbsp;Username: {user}</p>
      </div>

      <LiveActivity />
      <div className="mb-3">
        <span className="text-box-border d-block mb-2">You are</span>
        <div className="d-flex justify-content-center gap-3">
          <button id="ximage" className="btn p-0">
            <img
              src={displayImage()}
              width={94}
              className="img-fluid"
              alt="X"
            />
          </button>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "400px",
          height: "400px",
        }}
      >
        <img
          src="tic_tac_toe_board.png"
          alt="Tic Tac Toe Board"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "40px",
            padding: "40px",
          }}
        >
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "48px",
                color: "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
        <span className="text-box-border">X-score: 0</span>
        <span className="text-box-border">O-score: 0</span>
      </div>
      <span className="text-box-border d-block mb-3">Best of 1</span>
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
        <button id="playagain" className="btn btn-success btn-lg">
          Play again?
        </button>

        <form method="get" action="friends" className="d-inline">
          <button id="addfriend" className="btn btn-warning btn-lg">
            Add friend?
          </button>
        </form>
      </div>
    </main>
  );
}
