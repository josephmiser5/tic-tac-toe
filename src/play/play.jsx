import React, { useEffect, useMemo, useState } from "react";
import "./play.css";

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

function calculateWinner(cells) {
  for (const [a, b, c] of WIN_CONDITIONS) {
    const v = cells[a];
    if (v && v === cells[b] && v === cells[c]) return v;
  }
  return null;
}

function parseBestOf(gamemode) {
  const n = Number(String(gamemode).match(/\d+/)?.[0] ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function LiveActivity() {
  const [message, setMessage] = useState("");
  const users = useMemo(() => ["Billy", "Bob", "Joe"], []);

  useEffect(() => {
    const id = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      setMessage(`${randomUser} started a new game`);
    }, 5000);
    return () => clearInterval(id);
  }, [users]);

  return <p>{message}</p>;
}

export function Play() {
  // ── ALL state declarations first ──────────────────────────────────────
  const [message, setMessage] = useState("");
  const [gamemode, setGameMode] = useState("Best of 1");
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [numMoves, setNumMoves] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [starter, setStarter] = useState(() =>
    Math.random() < 0.5 ? "X" : "O",
  );
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [seriesLogged, setSeriesLogged] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [seriesWinner, setSeriesWinner] = useState(null);

  const bestOf = parseBestOf(gamemode);
  const neededToWin = Math.floor(bestOf / 2) + 1;

  // ── Restore state from localStorage on mount ──────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("ttt_gameState");
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      setBoard(s.board ?? Array(9).fill(null));
      setTurn(s.turn ?? "X");
      setNumMoves(s.numMoves ?? 0);
      setStarter(s.starter ?? "X");
      setScore(s.score ?? { X: 0, O: 0 });
      setSeriesLogged(s.seriesLogged ?? false);
      setGameMode(s.gamemode ?? "Best of 1");
      setGameHistory(s.gameHistory ?? []);
    } catch {
      localStorage.removeItem("ttt_gameState");
    }
  }, []);

  // ── Save state to localStorage on every change ────────────────────────
  useEffect(() => {
    localStorage.setItem(
      "ttt_gameState",
      JSON.stringify({
        board,
        turn,
        numMoves,
        starter,
        score,
        seriesLogged,
        gamemode,
        gameHistory,
      }),
    );
  }, [
    board,
    turn,
    numMoves,
    starter,
    score,
    seriesLogged,
    gamemode,
    gameHistory,
  ]);

  // ── Fetch logged-in user ───────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data.username))
      .catch(() => setUser(null));
  }, []);

  // ── Keep seriesWinner in sync with score/neededToWin ──────────────────
  useEffect(() => {
    if (score.X >= neededToWin) setSeriesWinner("X");
    else if (score.O >= neededToWin) setSeriesWinner("O");
    else setSeriesWinner(null);
  }, [neededToWin, score.X, score.O]);

  // ── Log result when series is won ─────────────────────────────────────
  useEffect(() => {
    if (!seriesWinner) return;
    if (seriesLogged) return;

    const humanMark = starter;
    const result = seriesWinner === humanMark ? "win" : "loss";

    fetch("/api/game/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
      credentials: "include",
    });

    addWinLossRow({ result, xScore: score.X, oScore: score.O });
    setSeriesLogged(true);
  }, [seriesWinner, seriesLogged, starter, score.X, score.O]);

  // ── Helpers ───────────────────────────────────────────────────────────
  function addWinLossRow({ result, xScore, oScore }) {
    fetch("/api/game/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, score: `${xScore}:${oScore}` }),
      credentials: "include",
    });
  }

  function displayImage() {
    return starter === "X" ? "orangeX.png" : "redO.png";
  }

  function resetRound({ nextStarter = "X" } = {}) {
    setBoard(Array(9).fill(null));
    setNumMoves(0);
    setTurn(nextStarter);
    setRoundResult(null);
  }

  function resetSeries() {
    const nextStarter = starter === "X" ? "O" : "X";
    setStarter(nextStarter);
    setScore({ X: 0, O: 0 });
    setSeriesWinner(null);
    setSeriesLogged(false);
    resetRound({ nextStarter });
    localStorage.removeItem("ttt_gameState");
  }

  const handleClick = (index) => {
    if (seriesWinner) return;
    if (roundResult) return;
    if (board[index]) return;

    const current = turn;
    const nextBoard = [...board];
    nextBoard[index] = current;

    const nextMoves = numMoves + 1;
    const w = calculateWinner(nextBoard);

    setBoard(nextBoard);
    setNumMoves(nextMoves);

    if (w) {
      setRoundResult(w);
      setScore((prev) => ({ ...prev, [w]: prev[w] + 1 }));
      return;
    }

    if (nextMoves === 9) {
      setRoundResult("draw");
      return;
    }

    setTurn(current === "X" ? "O" : "X");
  };

  // ── Derived display values ────────────────────────────────────────────
  const statusMessage = seriesWinner
    ? seriesWinner === starter
      ? "🎉 You won the series!"
      : "💀 Computer won the series!"
    : roundResult
      ? roundResult === "draw"
        ? "It's a draw!"
        : roundResult === starter
          ? "You won this round!"
          : "Computer won this round!"
      : `${turn === starter ? "Your" : "Computer's"} turn`;

  return (
    <main className="container text-center my-4">
      <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
        <button
          onClick={() => setGameMode("Best of 1")}
          id="bestof1"
          className="btn btn-success btn-lg"
          type="button"
        >
          Best of 1
        </button>
        <button
          onClick={() => setGameMode("Best of 2")}
          id="bestof2"
          className="btn btn-success btn-lg"
          type="button"
        >
          Best of 2
        </button>
        <button
          onClick={() => setGameMode("Best of 3")}
          id="bestof3"
          className="btn btn-success btn-lg"
          type="button"
        >
          Best of 3
        </button>
      </div>

      <div
        id="usernamebox"
        className="html-box mx-auto mb-3 p-2 border rounded"
        style={{ width: "300px" }}
      >
        <p className="mb-0">&nbsp;{user}</p>
      </div>

      <LiveActivity />

      <span className="text-box-border d-block mb-3">
        {gamemode} (first to {neededToWin})
      </span>

      <div className="mb-2">
        {!seriesWinner && !roundResult && (
          <span className="text-box-border d-inline-block mb-2">
            Turn: {turn}
          </span>
        )}
        {roundResult && (
          <span className="text-box-border d-inline-block mb-2">
            {roundResult === "draw"
              ? "Round: draw"
              : `Round winner: ${roundResult}`}
          </span>
        )}
        {seriesWinner && (
          <span className="text-box-border d-inline-block mb-2">
            Series winner: {seriesWinner}
          </span>
        )}
      </div>

      <div className="mb-3">
        <span className="text-box-border d-block mb-2">You are</span>
        <div className="d-flex justify-content-center gap-3">
          <button id="ximage" className="btn p-0" type="button">
            <img
              src={displayImage()}
              width={94}
              className="img-fluid"
              alt={starter}
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
              type="button"
              disabled={Boolean(seriesWinner || roundResult || board[index])}
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
        <span className="text-box-border">X-score: {score.X}</span>
        <span className="text-box-border">O-score: {score.O}</span>
      </div>

      <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
        <button
          id="playagain"
          className="btn btn-success btn-lg"
          type="button"
          onClick={() => {
            if (seriesWinner) resetSeries();
            else resetRound({ nextStarter: starter });
          }}
        >
          {seriesWinner ? "New series?" : "Play again?"}
        </button>

        <form method="get" action="friends" className="d-inline">
          <button
            id="addfriend"
            className="btn btn-warning btn-lg"
            type="submit"
          >
            Add friend?
          </button>
        </form>
      </div>
    </main>
  );
}
