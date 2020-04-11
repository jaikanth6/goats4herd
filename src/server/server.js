var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/../client"));

var players = {};

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
        delete players[socket.id];
        socket.emit("userDisconnect", socket.id);
        console.log("A user disconnected");
    });
});

var port = 3000;
http.listen(port, function () {
    console.log("Listening on port: " + port);
});

io.on("connection", function (socket) {
    socket.on("new player", function () {
        players[socket.id] = {
            x: 300,
            y: 300,
            color: "hsl(" + 360 * Math.random() + ", 50%, 50%)",
            name: `dawg_${socket.id}`,
        };
    });

    const stomps = 5;
    socket.on("movement", function (data) {
        var player = players[socket.id] || {};

        var deltaX = 0;
        var deltaY = 0;
        if (data.left) {
            deltaX -= 1;
        }
        if (data.up) {
            deltaY -= 1;
        }
        if (data.right) {
            deltaX += 1;
        }
        if (data.down) {
            deltaY += 1;
        }

        // NormalizeVec
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance != 0) {
            deltaX = deltaX / distance;
            deltaY = deltaY / distance;
        }

        // ScaleVec
        player.x += deltaX * stomps;
        player.y += deltaY * stomps;
    });
});

setInterval(function () {
    io.sockets.emit("game-state", players);
}, 1000 / 60);
