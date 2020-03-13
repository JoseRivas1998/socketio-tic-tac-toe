const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const io = require('socket.io-client');

const PORT = 5000;

const socket = io(`http://localhost:${PORT}`);

let uid;
let username;
let gid;
let opponent;

socket.on('rec_uid', (data) => {
    uid = data;
    readline.question("Hello! Please enter your name: ", name => {
        username = name;
        socket.emit('send_username', username);
    });
});

socket.on('wait_for_opponent', () => {
    console.log("Waiting for an opponent...");
});

socket.on('opponent_found', (data) => {
    const opponent = data.uname;
    gid = data.gid;
    console.log(`Opponent found! Their name is ${data.uname}.`);
    socket.emit('player_ready', {gid: gid});
});

const printBoard = (board) => {
    for (let row = 0; row < 3; row++) {
        let rowStr = '';
        for (let col = 0; col < 3; col++) {
            rowStr += board[row * 3 + col];
            if (col < 2) {
                rowStr += ' | ';
            }
        }
        console.log(rowStr);
        if(row < 2) {
            console.log('---------');
        }
    }
};

const inputMove = () => {
    readline.question('Enter your move (0-8): ', move => {
        const cell = Number(move);
        if(cell >= 0 && cell <= 8) {
            socket.emit('snd_move', {
                uid: uid,
                gid: gid,
                cell: cell
            });
        } else {
            console.log("Invalid input");
            inputMove();
        }
    });
};

socket.on('turn_start', data => {
    const isTurn = data.isTurn;
    printBoard(data.board);
    if(isTurn) {
        inputMove();
    } else {
        console.log("It is not your turn, waiting on opponent");
    }
});

socket.on('rej_move', data => {
    console.log(`Error: ${data.msg}`);
    if (data.isTurn) {
        inputMove();
    }
});

const playAgainPrompt = () => {
    readline.question("Play again? (Y/N) ", answer => {
        if(answer.charAt(0) == 'Y' || answer.charAt(0) == 'y') {
            socket.emit('play_again');
        } else {
            console.log("Good bye!");
            socket.close();
            process.exit();
        }
    });
}

socket.on('game_win', (data) => {
    printBoard(data.board);
    console.log("You win!");
    playAgainPrompt();
});

socket.on('game_lose', (data) => {
    printBoard(data.board);
    console.log("You lose!");
    playAgainPrompt();
});

socket.on('game_draw', (data) => {
    printBoard(data.board);
    console.log("It's a draw!");
    playAgainPrompt();
});
