import React from "react";
import "./play.css";

export function Play() {
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
        <p className="mb-0">&nbsp;Username: Tic_Tac_Toe_Player</p>
      </div>

      <p>Waiting for opponent move.... (Websocket connection placeholder)</p>

      <div className="mb-3">
        <span className="text-box-border d-block mb-2">Choose a letter</span>
        <div className="d-flex justify-content-center gap-3">
          <button id="ximage" className="btn p-0">
            <img src="orangeX.png" width={94} className="img-fluid" alt="X" />
          </button>
          <button id="oimage" className="btn p-0">
            <img src="redO.png" width={105} className="img-fluid" alt="O" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <img
          src="tic_tac_toe_board.png"
          width={450}
          className="img-fluid"
          alt="Tic tac toe board"
        />
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
