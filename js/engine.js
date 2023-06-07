"use strict";

// Global Constants Used Throughout the Program

const board = new Chess();
const engineStatus = {};
engineStatus.pv = [];
const stockfish = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('js/stockfish.js');


stockfish.postMessage('uci');
stockfish.postMessage('isready');
stockfish.postMessage('setoption name MultiPV value 3');
stockfish.postMessage('setoption name Contempt value 0');
stockfish.postMessage('setoption name Skill Level value 20');
// stockfish.postMessage('setoption name King Safety value 0');
stockfish.postMessage('setoption name Skill Level Maximum Error value 0');
stockfish.postMessage('setoption name Skill Level Probability value 128');
// stockfish.postMessage('go infinite');

function getEval(type, number) {
    // type -> 'cp' or 'mate'
    // number -> evaluation str

    let score = parseInt(number);

    if(type == 'mate') {

        if (board.turn() == 'w') {
            score = (score > 0 ? '+M' : '-M') + Math.abs(score);
        } else if (board.turn() == 'b') {
            score = (score > 0 ? '-M' : '+M') + Math.abs(score);
        }

    } else if (type == 'cp') {

        score = (score * (board.turn() === 'w' ? 1 : -1) / 100.0).toFixed(2);
        score = (score > 0 ? '+' : '') + score;
    }

    return score;
}

stockfish.onmessage = function(event) {
    let line = event;
    if (event && typeof event === "object") {line = event.data;} else {line = event;}


    let match = line.match(/^info.*multipv (\d+).*score (\w+) (-?\d+).*pv ([a-h][1-8])([a-h][1-8])([qrbn])?/);
    
    if (match) {

        const rank = match[1];
        const score = getEval(match[2], match[3]);
        const move = `${match[4]}${match[5]}${match[6] ? match[6] : ""}`;

        if (board.moves({verbose: true}).map(m => m.lan).includes(move)) {

            if (rank === '1') {

                // console.log(engineStatus);
                displayStatus();
                engineStatus.pv = [];

                // Is it sending feedback?
                if (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
                    engineStatus.depth = match[1];
                    engineStatus.nps = match[2];
                }
            }

            engineStatus.pv[Number(rank)-1] = {move: move, score: score};
        }
    }
};

const evalbar = document.querySelector('.bar');
const whitescore = document.querySelector('.score.whiteside');
const blackscore = document.querySelector('.score.blackside');

function displayStatus() {

    if (engineStatus.pv.length > 0) {

        // Set Bar of Engine

        const bestscore = engineStatus.pv[0]['score'];

        if (bestscore[1] === 'M' || Math.abs(Number(bestscore)) >= 4) {
            evalbar.setAttribute('style', `height: ${bestscore[0]==='+' ? '0':'100'}%`);
        } else {
            evalbar.setAttribute('style', `height: ${50-12.5*Number(bestscore)}%`);
        }

        if (bestscore[0] === '+') {
            whitescore.textContent = bestscore.substring(1);
            blackscore.textContent = '';
        } else if (bestscore[0] === '-') {
            blackscore.textContent = bestscore.substring(1);
            whitescore.textContent = '';
        }   
        
        // Draw Arrows

        removeArrow('engine');
        addArrow(engineStatus.pv[0].move.substring(0,2), engineStatus.pv[0].move.substring(2,4), 'engine', 1);
        for (let x = 1; x < engineStatus.pv.length; ++x) {

            if (engineStatus.pv[x].move[1] == 'M') {

                addArrow(engineStatus.pv[x].move.substring(0,2), engineStatus.pv[x].move.substring(2,4), 'engine', 1);

            } else if (engineStatus.pv[0].move[1] !== 'M') {

                const diff = Math.abs(Number(engineStatus.pv[0].score) - Number(engineStatus.pv[x].score));

                if (0 <= diff && diff <= 1) {
                    addArrow(engineStatus.pv[x].move.substring(0,2), engineStatus.pv[x].move.substring(2,4), 'engine', 1-diff);
                }
            }
        }
    }
}