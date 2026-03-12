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
    gameHistory: [],
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
app.post("/api/game/score", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { result } = req.body; // "win" | "loss" | "draw"
  if (result === "win") user.wins++;
  else if (result === "loss") user.losses++;
  else if (result === "draw") user.draws++;
  else return res.status(400).json({ error: "Invalid result" });

  res.json({ wins: user.wins, losses: user.losses, draws: user.draws });
});

// POST a new history entry
app.post("/api/game/history", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { result, score } = req.body;
  const entry = { user: "Computer", result, score, createdAt: Date.now() };
  user.gameHistory.unshift(entry);
  res.status(201).json(entry);
});

// GET history
app.get("/api/game/history", authMiddleware, (req, res) => {
  const user = findUser("username", req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.gameHistory);
});

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
