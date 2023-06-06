var http = require("http");
var url  = require("url");
var path = require("path");
var fs   = require("fs");
var port = process.argv[2] || 8080; // Defaults to port 8080

// Start the server.
http.createServer(function (request, response) {

    var cwd = process.cwd();
    var uri = url.parse(request.url).pathname; 
    var filename = path.join(cwd, uri);
        
    // Make sure the URI is valid and within the current working directory.
    if (uri.indexOf("/../") !== -1 || uri[0] !== "/" || path.relative(cwd, filename).substring(0, 3) === "../" || !fs.existsSync(filename)) {
            
        // If the URI does not exist, display a 404 error.
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;

    } else {

        // If the URI is a directory, try to load index.html.
        if (fs.statSync(filename).isDirectory()) {
            filename += "/index.html";
        }

        // If the URI is a file, try to load it.
        fs.readFile(filename, "binary", function (err, file) {
                
            // If the file cannot be loaded, display a 500 error.
            if (err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            // If the file loads correctly, write it to the client.
            var mime = get_mime(filename);
            response.writeHead(200, mime ? {"Content-Type": mime} : undefined);
            response.write(file, "binary");
            response.end();
        });
    }   
}).listen(parseInt(port, 10));


console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");


function get_mime(filename) {
    var ext = path.extname(filename);
    
    if (ext === ".html" || ext === ".htm") {
        return "text/html";
    } else if (ext === ".css") {
        return "text/css";
    } else if (ext === ".js") {
        return "application/javascript";
    } else if (ext === ".png") {
        return "image/png";
    } else if (ext === ".jpg" || ext === ".jpeg") {
        return "image/jpeg";
    } else if (ext === ".gif") {
        return "image/gif";
    } else if (ext === ".pdf") {
        return "application/pdf";
    } else if (ext === ".webp") {
        return "image/webp";
    } else if (ext === ".txt") {
        return "text/plain";
    } else if (ext === ".svg") {
        return "image/svg+xml";
    } else if (ext === ".xml") {
        return "application/xml";
    } else if (ext === ".bin") {
        return "application/octet-stream";
    } else if (ext === ".ttf") {
        return "application/x-font-ttf";
    } else if (ext === ".woff") {
        return "application/font-woff";
    }
}