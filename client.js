const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const io = require('socket.io-client');

const PORT = 5000;

const socket = io(`http://localhost:${PORT}`);

let uid;
let username;

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
    const gameid = data.gid;
    console.log(`Opponent found! Their name is ${data.uname}.`);

});
