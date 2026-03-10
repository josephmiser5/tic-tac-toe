const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.static("public"));

// ─── In-memory data stores ────────────────────────────────────────────────────
const users = [];
const sessions = {}; // { [token]: { userId, username } }
const games = {}; // { [gameId]: GameState }
const SALT_ROUNDS = 12;

// ─── Auth middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = sessions[token];
  if (!session)
    return res.status(401).json({ error: "Invalid or expired session" });
  req.user = session;
  next();
}

function findUser(field, value) {
  return users.find((u) => u[field] === value) || null;
}

// AUTH ENDPOINTS
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (findUser("username", username))
    return res.status(409).json({ error: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();
  users.push({
    id,
    username,
    passwordHash,
    wins: 0,
    losses: 0,
    draws: 0,
    friends: [],
  });
  res.status(201).json({ message: "Account created" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = findUser("username", username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const sessionToken = uuidv4();
  sessions[sessionToken] = { userId: user.id, username: user.username };

  res.cookie("token", sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60,
  });
  res.json({ username: user.username });
});

app.post("/api/logout", (req, res) => {
  const token = req.cookies.token;
  if (token) delete sessions[token];
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    username: user.username,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    friends: user.friends,
  });
});

// GAME ENDPOINTS
app.post("/api/game/new", authMiddleware, (req, res) => {
  const gameId = uuidv4();
  games[gameId] = {
    id: gameId,
    board: Array(9).fill(null), // 9 squares, null | "X" | "O"
    currentTurn: "X", // X always goes first
    playerX: req.user.username,
    playerO: req.body.opponent || null, // null = vs computer
    status: "ongoing", // "ongoing" | "won" | "draw"
    winner: null,
  };
  res.status(201).json(games[gameId]);
});

app.get("/api/game/:gameId", authMiddleware, (req, res) => {
  const game = games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json(game);
});

app.post("/api/game/:gameId/move", authMiddleware, (req, res) => {
  const game = games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.status !== "ongoing")
    return res.status(400).json({ error: "Game is already over" });

  const { square } = req.body;
  if (square === undefined || square < 0 || square > 8)
    return res.status(400).json({ error: "Invalid square (must be 0–8)" });
  if (game.board[square] !== null)
    return res.status(400).json({ error: "Square already taken" });

  const isPlayerX =
    req.user.username === game.playerX && game.currentTurn === "X";
  const isPlayerO =
    req.user.username === game.playerO && game.currentTurn === "O";
  if (game.playerO && !isPlayerX && !isPlayerO)
    return res.status(403).json({ error: "Not your turn" });

  game.board[square] = game.currentTurn;

  const winnerMark = checkWinner(game.board);
  if (winnerMark) {
    game.status = "won";
    game.winner = winnerMark === "X" ? game.playerX : game.playerO;
    recordResult(game);
  } else if (game.board.every((sq) => sq !== null)) {
    game.status = "draw";
    recordResult(game);
  } else {
    game.currentTurn = game.currentTurn === "X" ? "O" : "X";
  }

  res.json(game);
});

app.post("/api/game/:gameId/abandon", authMiddleware, (req, res) => {
  const game = games[req.params.gameId];
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.status !== "ongoing")
    return res.status(400).json({ error: "Game already ended" });

  game.status = "won";
  game.winner =
    req.user.username === game.playerX ? game.playerO : game.playerX;
  recordResult(game);

  res.json(game);
});

function recordResult(game) {
  if (game.status === "won") {
    const winner = findUser("username", game.winner);
    const loser = findUser(
      "username",
      game.winner === game.playerX ? game.playerO : game.playerX,
    );
    if (winner) winner.wins++;
    if (loser) loser.losses++;
  } else if (game.status === "draw") {
    const x = findUser("username", game.playerX);
    const o = findUser("username", game.playerO);
    if (x) x.draws++;
    if (o) o.draws++;
  }
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a]; // returns "X" or "O"
  }
  return null;
}

// WIN/LOSS LEADERBOARD ENDPOINT
app.get("/api/leaderboard", (req, res) => {
  const board = users
    .map(({ username, wins, losses, draws }) => ({
      username,
      wins,
      losses,
      draws,
    }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);
  res.json(board);
});

app.get("/api/stats/:username", (req, res) => {
  const user = findUser("username", req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    username: user.username,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
  });
});

// FRIENDS ENDPOINTS
app.get("/api/friends", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const enriched = user.friends.map((friendName) => {
    const friend = findUser("username", friendName);
    return friend
      ? {
          username: friend.username,
          wins: friend.wins,
          losses: friend.losses,
          draws: friend.draws,
        }
      : { username: friendName };
  });
  res.json(enriched);
});

app.post("/api/friends/:username", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  const target = findUser("username", req.params.username);

  if (!user) return res.status(404).json({ error: "Your account not found" });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target.username === user.username)
    return res.status(400).json({ error: "You cannot friend yourself" });
  if (user.friends.includes(target.username))
    return res.status(409).json({ error: "Already friends" });

  user.friends.push(target.username);
  res.status(201).json({ message: `${target.username} added as a friend` });
});

app.delete("/api/friends/:username", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const before = user.friends.length;
  user.friends = user.friends.filter((f) => f !== req.params.username);

  if (user.friends.length === before)
    return res.status(404).json({ error: "Friend not found" });

  res.json({ message: `${req.params.username} removed from friends` });
});

app.get("/api/quote", async (_req, res) => {
  try {
    const response = await fetch(
      "https://api.quotable.io/random?tags=inspirational",
    );
    if (!response.ok) throw new Error("Quote API unavailable");
    const data = await response.json();
    res.json({ content: data.content, author: data.author });
  } catch {
    res.json({
      content: "Every master was once a beginner.",
      author: "Unknown",
    });
  }
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
