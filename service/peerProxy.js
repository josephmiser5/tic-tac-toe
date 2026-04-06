const { WebSocketServer } = require("ws");

class PeerProxy {
  constructor(httpServer, sessions) {
    const wss = new WebSocketServer({ noServer: true });

    httpServer.on("upgrade", (req, socket, head) => {
      if (req.url !== "/ws") {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    });

    this.clients = new Map();

    wss.on("connection", (ws, req) => {
      const cookies = this.parseCookies(req.headers.cookie || "");
      const session = sessions[cookies.token];
      if (!session) {
        ws.close(4001, "Not authenticated");
        return;
      }

      const username = session.username;
      this.clients.set(username, ws);
      console.log(`WS connected: ${username}`);

      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (raw) => {
        let msg;
        try {
          msg = JSON.parse(raw);
        } catch {
          return;
        }
        this.handleMessage(username, msg);
      });

      ws.on("close", () => {
        this.clients.delete(username);
        console.log(`WS disconnected: ${username}`);
      });
    });

    setInterval(() => {
      wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 10000);
  }

  handleMessage(from, msg) {
    switch (msg.type) {
      case "game_invite": {
        const target = this.clients.get(msg.to);
        if (target && target.readyState === 1) {
          target.send(
            JSON.stringify({
              type: "game_invite",
              from,
              gamemode: msg.gamemode,
            }),
          );
        }
        break;
      }

      case "invite_accept": {
        const inviter = this.clients.get(msg.to);
        const roomId = `${msg.to}-${from}-${Date.now()}`;
        const gamemode = msg.gamemode || "Best of 1";
        if (inviter && inviter.readyState === 1) {
          inviter.send(
            JSON.stringify({
              type: "game_start",
              roomId,
              opponent: from,
              mark: "X",
              gamemode,
            }),
          );
        }
        const accepter = this.clients.get(from);
        if (accepter && accepter.readyState === 1) {
          accepter.send(
            JSON.stringify({
              type: "game_start",
              roomId,
              opponent: msg.to,
              mark: "O",
              gamemode,
            }),
          );
        }
        break;
      }
      case "invite_reject": {
        const inviter = this.clients.get(msg.to);
        if (inviter && inviter.readyState === 1) {
          inviter.send(JSON.stringify({ type: "invite_rejected", from }));
        }
        break;
      }
      case "game_move": {
        const opponent = this.clients.get(msg.to);
        if (opponent && opponent.readyState === 1) {
          opponent.send(
            JSON.stringify({
              type: "game_move",
              index: msg.index,
              mark: msg.mark,
              from,
            }),
          );
        }
        break;
      }
      case "game_over": {
        const opponent = this.clients.get(msg.to);
        if (opponent && opponent.readyState === 1) {
          opponent.send(
            JSON.stringify({ type: "game_over", result: msg.result, from }),
          );
        }
        break;
      }
    }
  }

  parseCookies(cookieStr) {
    const cookies = {};
    cookieStr.split(";").forEach((c) => {
      const [key, val] = c.trim().split("=");
      if (key) cookies[key] = val;
    });
    return cookies;
  }
}

module.exports = { PeerProxy };
