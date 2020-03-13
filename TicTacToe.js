const states = Object.freeze({
    WAITING_FOR_PLAYER: 0,
    PLAYING: 1
});

class TicTacToe {

    constructor(player0UID) {
        this.state = states.WAITING_FOR_PLAYER;
        this.player0UID = player0UID;
        this.player1UID = null;
    }

    isWaitingForOpponent() {
        return this.state === states.WAITING_FOR_PLAYER;
    }

    setPlayer1(player1UID) {
        this.player1UID = player1UID;
        this.state = states.PLAYING;
    }

}

module.exports = TicTacToe;
