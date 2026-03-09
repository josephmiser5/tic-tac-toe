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

const users = [];
const sessions = {};
const SALT_ROUNDS = 12;

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const exists = users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ error: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();
  users.push({ id, username, passwordHash });

  res.status(201).json({ message: "Account created" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
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

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const session = sessions[token];
  if (!session)
    return res.status(401).json({ error: "Invalid or expired session" });

  req.user = session;
  next();
}

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!` });
});
app.listen(port, () => console.log(`Server running on port ${port}`));
