import React, {Component} from 'react';
import io from 'socket.io-client';
import {Button, Col} from 'react-bootstrap';

import * as socketEvents from '../../socketEvents';
import UsernameInput from '../../components/UsernameInput/UsernameInput';
import Board from '../../components/Board/Board';

class Game extends Component {

    state = {
        socket: null,
        uid: null,
        username: '',
        submittedUsername: false,
        waitingForOpponent: false,
        opponent: null,
        gid: null,
        playing: false,
        currentTurn: false,
        board: null,
        highlightedCell: -1,
        error: null,
        gameEnd: null
    };

    componentDidMount() {
        const socket = io('http://localhost:5000');
        socket.on(socketEvents.REC_UID, data => {
            this.setState({uid: data});
        });
        socket.on(socketEvents.WAIT_FOR_OPPONENT, () => {
            this.setState({waitingForOpponent: true});
        });
        socket.on(socketEvents.OPPONENT_DISCONNECTED, () => {
            this.setState({
                gid: null,
                waitingForOpponent: true,
                opponent: null
            })
        });
        socket.on(socketEvents.OPPONENT_FOUND, data => {
            this.setState({
                waitingForUsername: false,
                opponent: data.uname,
                gid: data.gid
            });
            socket.emit(socketEvents.PLAYER_READY, {
                gid: data.gid
            });
        });
        socket.on(socketEvents.TURN_START, (data) => {
            this.setState({
                playing: true,
                currentTurn: data.isTurn,
                board: data.board
            });
        });
        socket.on(socketEvents.REJ_MOVE, data => {
            this.setState({
                error: data.msg
            });
            setTimeout(() => {
                this.setState({error: null})
            }, 750)
        });
        socket.on(socketEvents.GAME_WIN, (data) => {
            console.log(data);
            this.setState({
                gameEnd: "You win!",
                board: data.board
            });
        });
        socket.on(socketEvents.GAME_DRAW, (data) => {
            this.setState({
                gameEnd: "Tie Game!",
                board: data.board
            });
        });
        socket.on(socketEvents.GAME_LOSE, (data) => {
            this.setState({
                gameEnd: "You Lose!",
                board: data.board
            });
        });
        this.setState({socket: socket});
    }

    onUsernameChange = (event) => {
        this.setState({username: event.target.value});
    };

    onUsernameSubmit = (event) => {
        event.preventDefault();
        if (this.state.username.trim().length > 0) {
            this.state.socket.emit(socketEvents.SEND_USERNAME, this.state.username.trim());
            this.setState({submittedUsername: true});
        }
    };

    onCellEnter = (cell) => {
        this.setState({highlightedCell: cell});
    };

    onCellExit = (cell) => {
        this.setState({highlightedCell: -1})
    };

    onCellClick = (cell) => {
        this.state.socket.emit(socketEvents.SND_MOVE, {
            uid: this.state.uid,
            gid: this.state.gid,
            cell: cell
        })
    };

    onPlayAgain = () => {
        this.setState({
            waitingForOpponent: false,
            opponent: null,
            gid: null,
            playing: false,
            currentTurn: false,
            board: null,
            highlightedCell: -1,
            error: null,
            gameEnd: null
        });
        this.state.socket.emit(socketEvents.PLAY_AGAIN);
    };

    render() {
        if (!this.state.uid) {
            return (
                <Col className="text-center">
                    <h1>Connecting...</h1>
                </Col>
            );
        }
        if (!this.state.gid && !this.state.submittedUsername) {
            return (
                <UsernameInput
                    username={this.state.username}
                    changed={this.onUsernameChange}
                    submit={this.onUsernameSubmit}
                />
            );
        }
        if (!this.state.gid && this.state.waitingForOpponent) {
            return (
                <Col className="text-center">
                    <h1>Waiting For Opponent...</h1>
                </Col>
            );
        }

        if (this.state.gid && !this.state.playing) {
            return (
                <Col className="text-center">
                    <p>Opponent: {this.state.opponent}</p>
                </Col>
            );
        }

        if (this.state.gid) {
            let turn;
            if (this.state.currentTurn) {
                turn = (<p>It is your turn! Select a tile!</p>);
            } else {
                turn = (<p>It is {this.state.opponent}'s turn, please wait.</p>)
            }
            let error = null;
            if (this.state.error) {
                error = <p className="text-danger">{this.state.error}</p>
            }
            let gameEnd = null;
            if (this.state.gameEnd) {
                gameEnd = (
                    <React.Fragment>
                        <h2>{this.state.gameEnd}</h2>
                        <Button
                            variant="primary"
                            onClick={this.onPlayAgain}
                        >Play Again</Button>
                    </React.Fragment>
                );
            }
            return (
                <Col className="text-center">
                    <p>Opponent: {this.state.opponent}</p>
                    {turn}
                    <Board
                        board={this.state.board}
                        highlightedCell={this.state.highlightedCell}
                        cellEnter={this.onCellEnter}
                        cellExit={this.onCellExit}
                        cellClick={this.onCellClick}
                    />
                    {gameEnd}
                    {error}
                </Col>
            );
        }

        return null;
    }
}

export default Game;
