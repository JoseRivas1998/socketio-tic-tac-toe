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

    const assignGame = () => {
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
    }

    socket.on('send_username', data => {
        users[socket.uid] = {
            uname: data,
            socket: socket
        };
        assignGame();
    });
    socket.on('player_ready', data => {
        console.log(`${data.gid}: player with uid ${socket.uid} is ready.`);
        const game = games[data.gid];
        game.playerReadyUp(socket.uid);
        if(game.isPlaying()) {
            const player0 = users[game.player0UID];
            const player1 = users[game.player1UID];
            const turn = game.currentPlayer;
            player0.socket.emit('turn_start', {isTurn: game.player0UID === turn, board: [...game.board]});
            player1.socket.emit('turn_start', {isTurn: game.player1UID === turn, board: [...game.board]});
        } else {
            console.log(`${data.gid}: Waiting for other player`);
        }
    });
    socket.on('snd_move', data => {
        console.log('Recieved move', data);
        const uid = data.uid;
        const gid = data.gid;
        const cell = data.cell;
        const game = games[gid];
        const turn = game.currentPlayer;
        if(turn === uid) {
            if(game.makeMove(cell)) {
                const player0 = users[game.player0UID];
                const player1 = users[game.player1UID];
                const turn = game.currentPlayer;
                if(game.isWon()) {
                    if(game.winner === game.player0UID) {
                        player0.socket.emit('game_win', {board: [...game.board]});
                        player1.socket.emit('game_lose', {board: [...game.board]});
                    } else {
                        player1.socket.emit('game_win', {board: [...game.board]});
                        player0.socket.emit('game_lose', {board: [...game.board]});
                    }
                    delete games[gid];
                } else if(game.isDraw()) {
                    player0.socket.emit('game_draw', {board: [...game.board]});
                    player1.socket.emit('game_draw', {board: [...game.board]});
                    delete games[gid];
                } else {
                    player0.socket.emit('turn_start', {isTurn: game.player0UID === turn, board: [...game.board]});
                    player1.socket.emit('turn_start', {isTurn: game.player1UID === turn, board: [...game.board]});
                }
            } else {
                socket.emit('rej_move', {
                    isTurn: turn === uid,
                    msg: "That cell is already taken"
                });
            }
        } else {
            socket.emit('rej_move', {
                isTurn: turn === uid,
                msg: "It is not currently your turn"
            });
        }
    });
    socket.on('play_again', () => {
        assignGame();
    });
    socket.on('disconnect', () => {
        console.log(`Deleting user ${socket.uid}`);
        delete users[socket.uid];
    });
});
