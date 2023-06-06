"use strict";

// const board = new Chess();
// console.log(board.moves());

// var engine = INIT_ENGINE();

const engineStatus = {};
// const stockfish = STOCKFISH();
const stockfish = new Worker('js/stockfish.js');
const board = new Chess();


// console.log(typeof STOCKFISH);

stockfish.postMessage('uci');
stockfish.postMessage('isready');
stockfish.postMessage('setoption name Contempt value 0');
stockfish.postMessage('setoption name Skill Level value 20');
stockfish.postMessage('setoption name King Safety value 0');
stockfish.postMessage('setoption name Skill Level Maximum Error value 0');
stockfish.postMessage('setoption name Skill Level Probability value 128');

// stockfish.postMessage('position startpos moves e2e4 b8a6');
// stockfish.postMessage('go depth 20');

stockfish.onmessage = function(event) {
    var line;

    if (event && typeof event === "object") {
        line = event.data;
    } else {
        line = event;
    }

    if(line == 'uciok') {
        // engineStatus.loaded = true;
    } else if(line == 'readyok') {
        // engineStatus.ready = true;
    } else {
        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
        
        // Did stockfish finish calculating?
        if(match) {
            engineStatus.move = `${match[1]}${match[2]}${match[3] ? match[3] : ""}`;
        }

        // Is there a line its calculating?
        if(match = line.match(/^info .*\bpv ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {

            const move = `${match[1]}${match[2]}${match[3] ? match[3] : ""}`;

            if (board.moves({verbose: true}).map(m => m.lan).includes(move)) {
                engineStatus.move = move;
            } else {
                engineStatus.move = null;
            }
        }

        // Is it sending feedback?
        if (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
            engineStatus.depth = match[1];
            engineStatus.nps = match[2];
        }
        
        /// Is it sending feedback with a score?
        if(match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {

            let score = parseInt(match[2]);

            if(match[1] == 'mate') {

                if (board.turn() == 'w') {
                    score = (score > 0 ? '+M' : '-M') + Math.abs(score);
                } else if (board.turn() == 'b') {
                    score = (score > 0 ? '-M' : '+M') + Math.abs(score);
                }

            } else if (match[1] == 'cp') {

                score = (score * (board.turn() === 'w' ? 1 : -1) / 100.0).toFixed(1);
                score = (score > 0 ? '+' : '') + score;
            }

            if (engineStatus.move) {
                engineStatus.score = score;
            } else {
                engineStatus.score = null;
            }

            // if (match = line.match(/\b(upper|lower)bound\b/)) {
            //     // engineStatus.score = ((match[1] == 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score
            //     engineStatus.score = null;
            // } else {
            //     // console.log(board.moves({verbose: true}).map(m => m.lan));
                
            //     if (board.moves({verbose: true}).map(m => m.lan).includes(engineStatus.move)) {
            //         engineStatus.score = score;
            //     } else {
            //         engineStatus.score = null;
            //     }
            // }
        }
    }
    displayStatus();
};

const evalbar = document.querySelector('.bar');
const whitescore = document.querySelector('.score.whiteside');
const blackscore = document.querySelector('.score.blackside');

function displayStatus() {

    if (engineStatus.score) {

        console.log(engineStatus);

        if (engineStatus.score[1] === 'M' || Math.abs(Number(engineStatus.score)) >= 4) {
            evalbar.setAttribute('style', `height: ${engineStatus.score[0]==='+' ? '0':'100'}%`);
        } else {
            evalbar.setAttribute('style', `height: ${50-12.5*Number(engineStatus.score)}%`);
        }

        if (engineStatus.score[0] === '+') {
            whitescore.textContent = engineStatus.score.substring(1);
            blackscore.textContent = '';
        } else if (engineStatus.score[0] === '-') {
            blackscore.textContent = engineStatus.score.substring(1);
            whitescore.textContent = '';
        }   
    }
}






// stockfish.onmessage = function(event) {
//     const message = event.split(" ");

//     console.log(event);
//     if (message[0] === 'uciok') {

//         console.log("UCI is enabled!");

//     } else if (message[0] === 'readyok') {

//         console.log("Stockfish is ready!");

//     } else if (message[0] === 'info') {

//         if (message.includes("score")) {

//             if (message.includes("cp")) {

//                 console.log(Number(message[message.indexOf("cp")+1]/100));

//             } else if (message.includes("mate")) {

//             }
//         }

//     }

// }

