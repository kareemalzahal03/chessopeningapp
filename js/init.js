// We can load Stockfish.js via Web Workers or directly via a <script> tag.
// Web Workers are better since they don't block the UI, but they are not always avaiable.

var wait_for_script = false;

if (!Worker) {
    var script_tag  = document.createElement("script");
    script_tag.type ="text/javascript";
    script_tag.src  = "js/stockfish.asm.js";
    script_tag.onload = init;
    document.getElementsByTagName("head")[0].appendChild(script_tag);
    wait_for_script = true;
    setTimeout(function () {
        console.warn("Loading this example from the file: protocol will load the slower asm.js engine.\nRun server.js and then load http://localhost:8080/ for the WASM engine.");
    }, 3000);
}

// If we load Stockfish.js via a <script> tag, we need to wait until it loads.

if (!wait_for_script) {
    document.addEventListener("DOMContentLoaded", init);
}

// Initialize App

function init() {

    const engine  = document.createElement("script");
    engine.type ="text/javascript";
    engine.src = "js/engine.js";
    document.getElementsByTagName("body")[0].appendChild(engine);

    const boardgui  = document.createElement("script");
    boardgui.type ="text/javascript";
    boardgui.src = "js/boardgui.js";
    document.getElementsByTagName("body")[0].appendChild(boardgui);
}