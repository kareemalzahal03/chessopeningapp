"use strict";

/////////////////////////////// CONSTANTS ///////////////////////////////

const board = new Chess();
const stockfish =
  typeof STOCKFISH === "function" ? STOCKFISH() : new Worker("js/stockfish.js");
const engineStatus = {};
engineStatus.pv = [];

/////////////////////////////// INIT STOCKFISH ///////////////////////////////

stockfish.onmessage = onMessage;
stockfish.postMessage("uci");
stockfish.postMessage("isready");
stockfish.postMessage("setoption name MultiPV value 3");
stockfish.postMessage("setoption name Contempt value 0");
stockfish.postMessage("setoption name Skill Level value 20");
stockfish.postMessage("setoption name Skill Level Maximum Error value 0");
stockfish.postMessage("setoption name Skill Level Probability value 128");

/////////////////////////////// LOAD BOARD ///////////////////////////////



restartBoard();
// flipBoard();

/////////////////////////////// ADD CONTROL ///////////////////////////////

let mouseDownCoord = "";
let mouseUpCoord = "";

const pieces = document.querySelectorAll(".piece");
for (let x = 0; x < pieces.length; ++x) {
  pieces[x].addEventListener("click", function (event) {
    pieceLeftClicked(pieces[x].getAttribute("position"));
  });
  pieces[x].addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
  pieces[x].addEventListener("mousedown", function (event) {
    if (event.which == 3) mouseDownCoord = pieces[x].getAttribute("position");
  });
  pieces[x].addEventListener("mouseup", function (event) {
    if (event.which == 3) {
      mouseUpCoord = pieces[x].getAttribute("position");
      if (mouseUpCoord == mouseDownCoord) {
        pieceRightClicked(mouseUpCoord);
      } else {
        rightDragged(mouseDownCoord, mouseUpCoord);
      }
    }
  });
}

const squares = document.querySelectorAll(".square");
for (let x = 0; x < squares.length; ++x) {
  squares[x].addEventListener("click", function (event) {
    squareLeftClicked(squares[x].getAttribute("Position"));
  });
  squares[x].addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
  squares[x].addEventListener("mousedown", function (event) {
    if (event.which == 3) mouseDownCoord = squares[x].getAttribute("Position");
  });
  squares[x].addEventListener("mouseup", function (event) {
    if (event.which == 3) {
      mouseUpCoord = squares[x].getAttribute("Position");
      if (mouseUpCoord == mouseDownCoord) {
        squareRightClicked(mouseUpCoord);
      } else {
        rightDragged(mouseDownCoord, mouseUpCoord);
      }
    }
  });
}

const buttons = document.querySelectorAll("button");
for (let x = 0; x < buttons.length; ++x) {
  buttons[x].addEventListener("click", function (event) {
    if (buttons[x].classList.contains("undo")) {
      undoMove();
    } else if (buttons[x].classList.contains("restart")) {
      restartBoard();
    } else if (buttons[x].classList.contains("promotion-button")) {
      promotionButtonClicked(
        buttons[x].getAttribute("piecetype")
          ? buttons[x].getAttribute("piecetype")[1]
          : null
      );
    } else if (buttons[x].classList.contains("flipboard")) {
      flipBoard();
    }
  });
  buttons[x].addEventListener("mouseenter", function (event) {
    buttons[x].classList.add("hovered");
  });
  buttons[x].addEventListener("mouseout", function (event) {
    buttons[x].classList.remove("hovered");
  });
}