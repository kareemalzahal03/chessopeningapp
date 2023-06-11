/////////////////////////////// STOCKFISH FUNCTIONS ///////////////////////////////

function getScore(type, number) {
  // type -> 'cp' or 'mate'
  // number -> evaluation str

  let score = parseInt(number);

  if (type == "mate") {
    if (board.turn() == "w") {
      score = (score > 0 ? "+M" : "-M") + Math.abs(score);
    } else if (board.turn() == "b") {
      score = (score > 0 ? "-M" : "+M") + Math.abs(score);
    }
  } else if (type == "cp") {
    score = ((score * (board.turn() === "w" ? 1 : -1)) / 100.0).toFixed(2);
    score = (score > 0 ? "+" : "") + score;
  }

  return score;
}

function displayStatus() {

  // Update Eval Bar

  if (engineStatus.pv.length == 0) return;

  const evalbar = document.querySelector(".bar");
  const whitescore = document.querySelector(".score.whiteside");
  const blackscore = document.querySelector(".score.blackside");
  const bestscore = engineStatus.pv[0]["score"];

  if (bestscore[1] === "M" || Math.abs(Number(bestscore)) >= 4) {
    evalbar.setAttribute(
      "style",
      `height: ${bestscore[0] === "+" ? "0" : "100"}%`
    );
  } else {
    evalbar.setAttribute(
      "style",
      `height: ${50 - 12.5 * Number(bestscore)}%`
    );
  }

  if (bestscore[0] === "+") {
    whitescore.textContent = bestscore.substring(1);
    blackscore.textContent = "";
  } else if (bestscore[0] === "-") {
    blackscore.textContent = bestscore.substring(1);
    whitescore.textContent = "";
  }

  let str = `Stockfish 11    Nps: ${engineStatus.nps}    Depth: ${engineStatus.depth}/18\n`;

  // Draw Arrows
  removeArrow("engine");
  addArrow(engineStatus.pv[0].move.substring(0, 2),engineStatus.pv[0].move.substring(2, 4),"engine",1);
  str += `${engineStatus.pv[0].move}: ${engineStatus.pv[0].score}\n`;

  for (let x = 1; x < engineStatus.pv.length; ++x) {

    if (engineStatus.pv[x].move[1] == "M") {

      addArrow(engineStatus.pv[x].move.substring(0, 2),engineStatus.pv[x].move.substring(2, 4),"engine",1);
      str += `${engineStatus.pv[x].move}: ${engineStatus.pv[x].score}\n`;

    } else if (engineStatus.pv[0].move[1] !== "M") {

      const diff = Math.abs(Number(engineStatus.pv[0].score) - Number(engineStatus.pv[x].score));

      if (0 <= diff && diff <= 1) {
        addArrow(engineStatus.pv[x].move.substring(0, 2),engineStatus.pv[x].move.substring(2, 4),"engine",1 - diff);
        str += `${engineStatus.pv[x].move}: ${engineStatus.pv[x].score}\n`;
      }
    }
  }

  // Display Engine Results
  document.querySelector('.enginestatus').textContent = str;
}

function onMessage(event) {
  let line = event;
  let match;
  if (event && typeof event === "object") {line = event.data;} else {line = event;}

  
  if (match = line.match(/^bestmove/)) {

    engineStatus.nps = '-';
    displayStatus();

  } else if (match = line.match(/^info.*multipv (\d+).*score (\w+) (-?\d+).*pv ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {

    const rank = match[1];
    const score = getScore(match[2], match[3]);
    const move = `${match[4]}${match[5]}${match[6] ? match[6] : ""}`;

    if (board.isMoveLegal(move)) {
      if (rank === "1") {
        // Display recorded data of previous depth
        displayStatus();

        // Record feedback
        if ((match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/))) {
          engineStatus.depth = match[1];
          engineStatus.nps = match[2];
        }

        engineStatus.pv = [];
      }

      engineStatus.pv.push({ move: move, score: score });
    }
  }
}

function updatePosition() {
  stockfish.postMessage(`position fen ${board.fen()}`);
  stockfish.postMessage("go depth 18");
}

/////////////////////////////// BOARD COLOR ///////////////////////////////

// Adds 'color' class to square with ID 'coord'
function addColor(coord, color) {
  const square = document.querySelector(`[position='${coord}'].square`);
  square.classList.add(color);
}

// Removes 'color' from classlist of all squares
function removeColor(color) {
  const coloredSquares = document.querySelectorAll(`.${color}`);
  for (let x = 0; x < coloredSquares.length; x++) {
    coloredSquares[x].classList.remove(color);
  }
}

// Removes any color classes added to any square on the board
function removeAllColors() {
  const squares = document.querySelectorAll(".square");
  for (let x = 0; x < squares.length; x++) {
    squares[x].setAttribute("class", "square");
  }
}

// Adds 'color' to legal squares from coord
function colorLegalMoves(coord, color) {
  const legalSquares = board.moves({ square: coord, verbose: true });
  for (let x = 0; x < legalSquares.length; x++) {
    addColor(legalSquares[x].to, color);
  }
}

/////////////////////////////// ARROWS ///////////////////////////////

// Draws arrow fromCoord toCoord with type being 'user' or 'book'
function addArrow(fromCoord, toCoord, type, opacity) {
  if (
    type == "user" &&
    !!document.querySelector(`.arrow.${fromCoord}${toCoord}`)
  ) {
    if (!!document.querySelector(`.user.arrow.${fromCoord}${toCoord}`)) {
      document.querySelector(`.user.arrow.${fromCoord}${toCoord}`).remove();
    }
    return;
  }

  const x1 = 6.25 + 12.5 * (fromCoord[0].charCodeAt(0) - 97);
  const y1 = 6.25 + 12.5 * (8 - fromCoord[1]);
  const x2 = 6.25 + 12.5 * (toCoord[0].charCodeAt(0) - 97);
  const y2 = 6.25 + 12.5 * (8 - toCoord[1]);
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const dirx = (x2 - x1) / dist;
  const diry = (y2 - y1) / dist;

  document.querySelector(".arrows").insertAdjacentHTML(
    "beforeend",
    `
    <polygon class="${type} arrow ${fromCoord}${toCoord}" 
       ${opacity ? 'style="opacity: ' + opacity + '"' : ""}" points=
     "${x1 + 4.5 * dirx + 1.375 * diry} ${y1 + 4.5 * diry - 1.375 * dirx},
      ${x1 + (dist - 4.5) * dirx + 1.375 * diry} ${
      y1 + (dist - 4.5) * diry - 1.375 * dirx
    },
      ${x1 + (dist - 4.5) * dirx + 3.25 * diry} ${
      y1 + (dist - 4.5) * diry - 3.25 * dirx
    },
      ${x1 + dist * dirx} ${y1 + dist * diry},
      ${x1 + (dist - 4.5) * dirx - 3.25 * diry} ${
      y1 + (dist - 4.5) * diry + 3.25 * dirx
    },
      ${x1 + (dist - 4.5) * dirx - 1.375 * diry} ${
      y1 + (dist - 4.5) * diry + 1.375 * dirx
    },
      ${x1 + 4.5 * dirx - 1.375 * diry} ${
      y1 + 4.5 * diry + 1.375 * dirx
    }"></polygon>`
  );
}

// Removes all elements with class 'arrow' that contain class 'user'
function removeArrow(type) {
  const typeArrows = document.querySelectorAll(`.${type}.arrow`);
  for (let x = 0; x < typeArrows.length; x++) {
    typeArrows[x].remove();
  }
}

// Removes all elements with class 'arrow'
function removeAllArrows() {
  const arrows = document.querySelectorAll(".arrow");
  for (let x = 0; x < arrows.length; x++) {
    arrows[x].remove();
  }
}

// Adds all book moves as arrows
function addBookArrows() {
  const legalMoves = board.moves({ verbose: true });

  for (let x = 0; x < legalMoves.length; ++x) {
    board.move(legalMoves[x]);

    if (epdName[board.epd()] !== undefined) {
      addArrow(legalMoves[x].from, legalMoves[x].to, "book");
    }

    board.undo();
  }
}

/////////////////////////////// BOARD DRAWER ///////////////////////////////

function drawBoard() {
  removeAllArrows();
  updatePosition();

  // Drawing Pieces
  const pieces = document.querySelectorAll(".piece");
  for (let x = 0; x < pieces.length; ++x) {
    pieces[x].classList.add("hidden");
  }

  for (let i = 0; i < 64; i++) {
    const layout = board.board()[i % 8][Math.floor(i / 8)];

    if (!!layout) {
      let piece = document.querySelector(
        `[piecetype='${layout.color}${layout.type}'].piece.hidden`
      );

      if (piece == null) {
        piece = document.querySelector(".piece.hidden");
        piece.setAttribute("piecetype", `${layout.color}${layout.type}`);
      }

      piece.setAttribute("position", layout.square);
      piece.classList.remove("hidden");
    }
  }

  // Drawing Book Arrows

  const legalMoves = board.moves({ verbose: true });

  for (let x = 0; x < legalMoves.length; ++x) {
    board.move(legalMoves[x]);

    if (epdName[board.epd()] !== undefined) {
      addArrow(legalMoves[x].from, legalMoves[x].to, "book");
    }

    board.undo();
  }

  // Update Name of Openning
  if (!!epdName[board.epd()]) {
    document.querySelector(".openingname").innerHTML = epdName[board.epd()];
  }
  document.querySelector(".pgn").innerHTML = board.pgn();
}

function restartBoard() {
  board.reset();
  drawBoard();
}

function undoMove() {
  board.undo();
  drawBoard();
}

function doMove(move) {
  if (board.isMoveLegal(move)) {
    board.move(move);
    drawBoard();
  }
}

/////////////////////////////// EVENTS ///////////////////////////////

let firstSelectedCoord = null;
let secondSelectedCoord = null;

function select(coord) {
  if (firstSelectedCoord === null) {
    firstSelectedCoord = coord;

    addColor(coord, "highlight");
    colorLegalMoves(coord, "highlight");
  } else if (secondSelectedCoord === null) {
    secondSelectedCoord = coord;

    // Can I Promote? If so, open promotion prompt.
    if (board.isMoveLegal(firstSelectedCoord + secondSelectedCoord + "q")) {
      const popup = document.querySelector(`.${board.turn()}.promotion`);
      popup.classList.remove("hidden");
      popup.setAttribute("position", secondSelectedCoord);
    } else {
      doMove(firstSelectedCoord + secondSelectedCoord);
      deSelect();
    }
  }
}

function promotionButtonClicked(piecetype) {
  if (firstSelectedCoord && secondSelectedCoord && piecetype)
    doMove(firstSelectedCoord + secondSelectedCoord + piecetype);

  deSelect();
}

function deSelect() {
  firstSelectedCoord = null;
  secondSelectedCoord = null;
  removeColor("highlight");

  const popups = document.querySelectorAll(".promotion");
  popups[0].classList.add("hidden");
  popups[1].classList.add("hidden");
}

function pieceRightClicked(coord) {
  deSelect();
  addColor(coord, "red");
}

function squareRightClicked(coord) {
  deSelect();
  addColor(coord, "red");
}

function squareLeftClicked(coord) {
  removeAllColors();
  removeArrow("user");
  if (firstSelectedCoord) {
    select(coord);
  }
}

function pieceLeftClicked(coord) {
  removeAllColors();
  removeArrow("user");
  select(coord);
}

function rightDragged(fromCoord, toCoord) {
  deSelect();
  addArrow(fromCoord, toCoord, "user");
}
