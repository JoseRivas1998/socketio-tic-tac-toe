const express = require('express');
const app = express();
const TicTacToe = require('./TicTacToe');

const PORT = 5000;

app.get('/', (req, res) => {
    const url = req.url;

    console.log(`Received a request on ${url}`);
    res.send('Hello world!');
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}, connect on http://localhost:${PORT}`);
});

const io = require('socket.io')(server);

const users = {};
const games = {};

io.on('connection', (socket) => {
    do {
        socket.uid = '-' + Math.random().toString(26).substr(2, 9);
    } while (users[socket.uid]);
    console.log(`New user connected with uid ${socket.uid}`);
    socket.emit('rec_uid', socket.uid);
    socket.on('send_username', data => {
        users[socket.uid] = {
            uname: data,
            socket: socket
        };

        const waitingGames = Object.keys(games).filter((gid) => {
            return games[gid].isWaitingForOpponent();
        });
        if (waitingGames.length > 0) {
            const gid = waitingGames[0];
            const foundGame = games[gid];
            const player0 = foundGame.player0UID;
            const player1 = socket.uid;
            const opponent = users[player0];
            const player = users[player1];
            opponent.socket.emit('opponent_found', {
                uname: player.uname,
                gid: gid
            });
            socket.emit('opponent_found', {
                uname: opponent.uname,
                gid: gid
            });
            foundGame.setPlayer1(player1);

        } else {
            const newGame = new TicTacToe(socket.uid);
            let gid;
            do {
                gid = '-' + Math.random().toString(26).substr(2, 9);
            } while (games[gid]);
            games[gid] = newGame;
            socket.emit('wait_for_opponent');
        }

    });
});
