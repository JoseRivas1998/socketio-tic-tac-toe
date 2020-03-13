const states = Object.freeze({
    WAITING_FOR_PLAYER: 0,
    WAITING_FOR_READY: 1,
    PLAYING: 2,
    DRAW: 3,
    GAME_WON: 4
});

class TicTacToe {

    constructor(player0UID) {
        this.state = states.WAITING_FOR_PLAYER;
        this.player0UID = player0UID;
        this.player1UID = null;
        this.player0Ready = false;
        this.player1Ready = false;
        this.currentPlayer = null;
        this.currentChar = null;
        this.board = [];
        for(let i = 0; i < 9; i++) {
            this.board.push(' ');
        }
        this.winner = null;
    }

    isWaitingForOpponent() {
        return this.state === states.WAITING_FOR_PLAYER;
    }

    isPlaying() {
        return this.state === states.PLAYING;
    }

    isDraw() {
        return this.state === states.DRAW;
    }

    isWon() {
        return this.state === states.GAME_WON;
    }

    setPlayer1(player1UID) {
        this.player1UID = player1UID;
        this.state = states.WAITING_FOR_READY;
    }

    playerReadyUp(uid) {
        this.player0Ready = this.player0Ready || this.player0UID === uid;
        this.player1Ready = this.player1Ready || this.player1UID === uid;
        if (this.player0Ready && this.player1Ready) {
            this.state = states.PLAYING;
            this.currentPlayer = Math.random() < 0.5 ? this.player0UID : this.player1UID;
            this.currentChar = 'O';
        }
    }

    checkVictory() {
        // Diagonals
        if(this.board[0] !== ' ' && this.board[0] === this.board[4] && this.board[4] === this.board[8]) {
            return true;
        }
        
        if(this.board[2] !== ' ' && this.board[2] === this.board[4] && this.board[4] === this.board[6]) {
            return true;
        }
        
        // Rows
        if(this.board[0] !== ' ' && this.board[0] === this.board[1] && this.board[1] === this.board[2]) {
            return true;
        }
        if(this.board[3] !== ' ' && this.board[3] === this.board[4] && this.board[4] === this.board[5]) {
            return true;
        }
        if(this.board[6] !== ' ' && this.board[6] === this.board[7] && this.board[7] === this.board[8]) {
            return true;
        }
        
        // Cols
        if(this.board[0] !== ' ' && this.board[0] === this.board[3] && this.board[3] === this.board[6]) {
            return true;
        }
        if(this.board[1] !== ' ' && this.board[1] === this.board[4] && this.board[4] === this.board[7]) {
            return true;
        }
        if(this.board[2] !== ' ' && this.board[2] === this.board[5] && this.board[5] === this.board[8]) {
            return true;
        }

        return false;
    }

    checkDraw() {
        for (let i = 0; i < this.board.length; i++) {
            if(this.board[i] === ' ') {
                return false;
            }
        }
        return true;
    }

    makeMove(cell) {
        if(this.board[cell] !== ' ') {
            return false;
        }
        this.board[cell] = this.currentChar;
        if(this.checkVictory()) {
            this.winner = this.currentPlayer;
            this.state = states.GAME_WON;
        } else if(this.checkDraw()) {
            this.state = states.DRAW;
        } else {
            this.currentChar = this.currentChar === 'O' ? 'X' : 'O';
            this.currentPlayer = this.currentPlayer === this.player0UID ? this.player1UID : this.player0UID;
        }
        return true;
    }

}

module.exports = TicTacToe;
