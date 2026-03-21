const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const DB = require("./database.js");

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.static("public"));

const sessions = {};
const SALT_ROUNDS = 12;

// middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = sessions[token];
  if (!session)
    return res.status(401).json({ error: "Invalid or expired session" });
  req.user = session;
  next();
}

// auth
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (await DB.getUser(username))
    return res.status(409).json({ error: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await DB.createUser(username, passwordHash);
  res.status(201).json({ message: "Account created" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await DB.getUser(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const sessionToken = uuidv4();
  sessions[sessionToken] = { userId: user._id, username: user.username };

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

app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await DB.getUser(req.user.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    username: user.username,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    friends: user.friends,
  });
});

// game
app.post("/api/game/score", authMiddleware, async (req, res) => {
  const { result } = req.body;
  if (!["win", "loss", "draw"].includes(result))
    return res.status(400).json({ error: "Invalid result" });

  await DB.updateScore(req.user.username, result);
  const user = await DB.getUser(req.user.username);
  res.json({ wins: user.wins, losses: user.losses, draws: user.draws });
});

app.post("/api/game/history", authMiddleware, async (req, res) => {
  const { result, score } = req.body;
  const entry = { user: "Computer", result, score, createdAt: Date.now() };
  await DB.addGameHistory(req.user.username, entry);
  res.status(201).json(entry);
});

app.get("/api/game/history", authMiddleware, async (req, res) => {
  const history = await DB.getGameHistory(req.user.username);
  res.json(history);
});

app.get("/api/game/state", authMiddleware, async (req, res) => {
  const state = await DB.getGameState(req.user.username);
  res.json(state);
});

app.post("/api/game/state", authMiddleware, async (req, res) => {
  await DB.saveGameState(req.user.username, req.body);
  res.json({ ok: true });
});

app.delete("/api/game/state", authMiddleware, async (req, res) => {
  await DB.deleteGameState(req.user.username);
  res.json({ ok: true });
});

// leaderboard
app.get("/api/leaderboard", async (req, res) => {
  const board = await DB.getLeaderboard();
  res.json(board);
});

app.get("/api/stats/:username", async (req, res) => {
  const user = await DB.getUser(req.params.username);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    username: user.username,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
  });
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

DB.connect().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
