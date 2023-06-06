'use strict';

/////////////////////////////// color.js ///////////////////////////////

// Adds 'color' class to square with ID 'coord'
function addColor(coord, color) {

  const square = document.querySelector(`[position='${coord}'].square`)
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

  const squares = document.querySelectorAll('.square');
  for (let x = 0; x < squares.length; x++) {
    squares[x].setAttribute('class','square');
  }
}

/////////////////////////////// arrows.js ///////////////////////////////

// Draws arrow fromCoord toCoord with type being 'user' or 'book'
function addArrow(fromCoord, toCoord, type) {

  if (!!document.getElementById(`arrow-${fromCoord}${toCoord}`)) {
    if (document.getElementById(`arrow-${fromCoord}${toCoord}`).classList.contains('user'))
      document.getElementById(`arrow-${fromCoord}${toCoord}`).remove();   
    return;
  }

  const x1 = 6.25 + 12.5*(fromCoord[0].charCodeAt(0)-97);
  const y1 = 6.25 + 12.5*(8-fromCoord[1]);
  const x2 = 6.25 + 12.5*(toCoord[0].charCodeAt(0)-97);
  const y2 = 6.25 + 12.5*(8-toCoord[1]);
  const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const dirx = (x2-x1)/dist;
  const diry = (y2-y1)/dist;

  document.querySelector('.arrows').insertAdjacentHTML('beforeend',`
  <polygon id="arrow-${fromCoord}${toCoord}" class="${type} arrow" points=
   "${x1+4.5*dirx+1.375*diry} ${y1+4.5*diry-1.375*dirx},
    ${x1+(dist-4.5)*dirx + 1.375*diry} ${y1+(dist-4.5)*diry - 1.375*dirx},
    ${x1+(dist-4.5)*dirx + 3.25*diry} ${y1+(dist-4.5)*diry - 3.25*dirx},
    ${x1+dist*dirx} ${y1+dist*diry},
    ${x1+(dist-4.5)*dirx - 3.25*diry} ${y1+(dist-4.5)*diry + 3.25*dirx},
    ${x1+(dist-4.5)*dirx - 1.375*diry} ${y1+(dist-4.5)*diry + 1.375*dirx},
    ${x1+4.5*dirx-1.375*diry} ${y1+4.5*diry+1.375*dirx}"></polygon>`);
}

// Removes all elements with class 'arrow' that contain class 'user'
function removeAllUserArrows() {
  const userArrows = document.querySelectorAll('.user.arrow');
  for (let x = 0; x < userArrows.length; x++) {
    userArrows[x].remove();
  }
}

// Removes all elements with class 'arrow'
function removeAllArrows() {
  const arrows = document.querySelectorAll('.arrow');
  for (let x = 0; x < arrows.length; x++) {
    arrows[x].remove();
  }
}

/////////////////////////////// board.js ///////////////////////////////

// Returns the Extended Position Description of the chess board
board.epd = function() {
  return this.fen().split(" ").slice(0,4).join(" ");
}

// Updates the side elements pgn and position name
function drawSide() {
  if (!!epdName[board.epd()]) {
    document.querySelector('.openingname').innerHTML = epdName[board.epd()];
  }
  document.querySelector('.pgn').innerHTML = board.pgn();
}

function get_moves() {
  let moves = '';
  let history = board.history({verbose: true});
        
  for(let i = 0; i < history.length; ++i) {
    let move = history[i];
    moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
  }
        
  return moves;
}

function drawBoard() {

  // stockfish.postMessage('stop');
  stockfish.postMessage(`position fen ${board.fen()}`);
  // stockfish.postMessage('position startpos moves' + get_moves());
  stockfish.postMessage('go depth 20');

  removeAllArrows();
  closePopUps();

  // Drawing Pieces
  const pieces = document.querySelectorAll('.piece');
  for (let x = 0; x < pieces.length; ++x) {
    pieces[x].classList.add('hidden');
  }

  for (let i = 0; i < 64; i++) {

    const layout = board.board()[i%8][Math.floor(i/8)];

    if (!!layout) {
      
      let piece = document.querySelector(`[piecetype='${layout.color}${layout.type}'].piece.hidden`);

      if (piece == null) {
        piece = document.querySelector('.piece.hidden');
        piece.setAttribute('piecetype',`${layout.color}${layout.type}`)
      }

      piece.setAttribute('position', layout.square);
      piece.classList.remove('hidden');
    }
  }

  // Drawing Book Arrows

  const legalMoves = board.moves({verbose: true});

  for (let x = 0; x < legalMoves.length; ++x) {

    board.move(legalMoves[x]);


    if (epdName[board.epd()] !== undefined)
      addArrow(legalMoves[x].from, legalMoves[x].to, 'book');

    board.undo();
  }
}

function restartBoard() {
  board.reset();
  drawBoard(); 
  drawSide();
}

function undoMove() {
  board.undo();
  drawBoard(); 
  drawSide();
}

function doMove(move) {

  const legalmoves = board.moves({verbose:true}).map(move => move.lan);

  if (legalmoves.includes(move)) {
    board.move(move);
    drawBoard(); 
    drawSide();
  }
}

function colorLegalMoves(coord, color) {
  const legalSquares = board.moves({square: coord, verbose: true})
  for(let x = 0; x < legalSquares.length; x++) {
    addColor(legalSquares[x].to, color);
  }
}

/////////////////////////////// mouseevents.js ///////////////////////////////

let firstSelectedCoord = null;
let secondSelectedCoord = null;

function closePopUps() {

  const popups = document.querySelectorAll('.promotion');
  popups[0].classList.add('hidden');
  popups[1].classList.add('hidden');
}

function pieceRightClicked(coord) {

  firstSelectedCoord = null;
  secondSelectedCoord = null;
  removeColor('highlight');
  addColor(coord, 'red');
  closePopUps();
}

function squareRightClicked(coord) {

  firstSelectedCoord = null;
  secondSelectedCoord = null;
  removeColor('highlight');
  addColor(coord, 'red');
  closePopUps();
}

function squareLeftClicked(coord) {

  removeAllColors();
  removeAllUserArrows();

  if (firstSelectedCoord !== null) {

    secondSelectedCoord = coord;

    if (board.moves({verbose:true}).map(move => move.lan).includes(firstSelectedCoord+secondSelectedCoord+'q')) {

      const popup = document.querySelector(`.${board.turn()}.promotion`);
      popup.classList.remove('hidden');
      popup.setAttribute('position', secondSelectedCoord);

    } else {
      doMove(firstSelectedCoord+secondSelectedCoord);
      closePopUps();
      firstSelectedCoord = null;
      secondSelectedCoord = null;
    }
  }
}

function pieceLeftClicked(coord) {

  removeAllColors();
  removeAllUserArrows();

  if (firstSelectedCoord === null) {

    firstSelectedCoord = coord;
    addColor(coord,'highlight');
    colorLegalMoves(coord, 'highlight');

  } else {

    secondSelectedCoord = coord;

    // check if promotion is possible
    if (board.moves({verbose:true}).map(move => move.lan).includes(firstSelectedCoord+secondSelectedCoord+'q')) {
      
      const popup = document.querySelector(`.${board.turn()}.promotion`);
      popup.classList.remove('hidden');
      popup.setAttribute('position', secondSelectedCoord);

    } else {

      doMove(firstSelectedCoord+secondSelectedCoord);
      closePopUps();
      firstSelectedCoord = null;
      secondSelectedCoord = null;
    }
  }
}

function rightDragged(fromCoord, toCoord) {

  firstSelectedCoord = null;
  removeColor('highlight');
  addArrow(fromCoord, toCoord, 'user');
}

/////////////////////////////// eventlisteners.js ///////////////////////////////

let mouseDownCoord = "";
let mouseUpCoord = "";

const pieces = document.querySelectorAll('.piece');
for (let x = 0; x < pieces.length; ++x) {
  pieces[x].addEventListener('click', function(event) {
    pieceLeftClicked(pieces[x].getAttribute('position'));
  })
  pieces[x].addEventListener('contextmenu', function(event) {
    event.preventDefault();
  })
  pieces[x].addEventListener('mousedown', function(event) {
    if (event.which == 3)
      mouseDownCoord = pieces[x].getAttribute('position');
  })
  pieces[x].addEventListener('mouseup', function(event) {
    if (event.which == 3) {
      mouseUpCoord = pieces[x].getAttribute('position');
      if (mouseUpCoord == mouseDownCoord) {
        pieceRightClicked(mouseUpCoord);
      } else {
        rightDragged(mouseDownCoord, mouseUpCoord);
      }
    }
  })
}

const squares = document.querySelectorAll('.square');
for (let x = 0; x < squares.length; ++x) {
  squares[x].addEventListener('click', function(event) {
    squareLeftClicked(squares[x].getAttribute("Position"));
  })
  squares[x].addEventListener('contextmenu', function(event) {
    event.preventDefault();
  })
  squares[x].addEventListener('mousedown', function(event) {
    if (event.which == 3)
      mouseDownCoord = squares[x].getAttribute("Position");
  })
  squares[x].addEventListener('mouseup', function(event) {
    if (event.which == 3) {
      mouseUpCoord = squares[x].getAttribute("Position");
      if (mouseUpCoord == mouseDownCoord) {
        squareRightClicked(mouseUpCoord);
      } else {
        rightDragged(mouseDownCoord, mouseUpCoord);
      }
    }
  })
}

const buttons = document.querySelectorAll('button');

for (let x = 0; x < buttons.length; ++x) {
  buttons[x].addEventListener('click', function(event) {
    if (buttons[x].classList.contains('undo')) {
      undoMove();
    } else if (buttons[x].classList.contains('restart')) {
      restartBoard();
    } else if (buttons[x].classList.contains('promotion-button')) {
      if (buttons[x].classList.contains('exit')) {
        closePopUps();
        firstSelectedCoord = null;
        secondSelectedCoord = null;
      } else {
        const type = buttons[x].getAttribute('piecetype')[1];
        doMove(firstSelectedCoord+secondSelectedCoord+type);
        closePopUps();
        firstSelectedCoord = null;
        secondSelectedCoord = null;
      }
    }
  })
  buttons[x].addEventListener('mouseenter', function(event) {
    buttons[x].classList.add('hovered');
  })
  buttons[x].addEventListener('mouseout', function(event) {
    buttons[x].classList.remove('hovered');
  })
}

restartBoard();