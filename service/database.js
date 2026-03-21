const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const config = require("./dbConfig.json");

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db("tictactoe");

const usersCol = db.collection("users");
const historyCol = db.collection("gameHistory");
const gameStateCol = db.collection("gameState");
async function connect() {
  await db.command({ ping: 1 });
  console.log("DB connected");
}

async function createUser(username, passwordHash) {
  const doc = {
    username,
    passwordHash,
    wins: 0,
    losses: 0,
    draws: 0,
    friends: [],
  };
  await usersCol.insertOne(doc);
}

async function getUser(username) {
  return usersCol.findOne({ username });
}

async function updateScore(username, result) {
  const field =
    result === "win" ? "wins" : result === "loss" ? "losses" : "draws";
  await usersCol.updateOne({ username }, { $inc: { [field]: 1 } });
}

async function addGameHistory(username, entry) {
  await historyCol.insertOne({ username, ...entry });
}

async function getGameHistory(username) {
  return historyCol.find({ username }).sort({ createdAt: -1 }).toArray();
}

async function getLeaderboard() {
  return usersCol
    .find(
      {},
      { projection: { username: 1, wins: 1, losses: 1, draws: 1, _id: 0 } },
    )
    .sort({ wins: -1 })
    .limit(10)
    .toArray();
}

async function getGameState(username) {
  const doc = await gameStateCol.findOne({ username });
  return doc ? doc.state : null;
}

async function saveGameState(username, state) {
  await gameStateCol.updateOne(
    { username },
    { $set: { username, state } },
    { upsert: true },
  );
}

async function deleteGameState(username) {
  await gameStateCol.deleteOne({ username });
}

module.exports = {
  connect,
  createUser,
  getUser,
  updateScore,
  addGameHistory,
  getGameHistory,
  getLeaderboard,
  getGameState,
  saveGameState,
  deleteGameState,
};
