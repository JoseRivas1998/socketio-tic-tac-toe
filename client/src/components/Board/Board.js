import React from 'react';
import {Col, Row} from 'react-bootstrap';

import cssClasses from './Board.module.css';

const board = (props) => {
    const board = [];
    for (let i = 0; i < props.board.length; i += 3) {
        board.push([...props.board.slice(i, i + 3)]);
    }
    const boardRows = [];
    for (let row = 0; row < board.length; row++) {
        const rowCols = [];
        for (let col = 0; col < board[row].length; col++) {
            const cell = row * board.length + col;
            const classes = [cssClasses.Cell, "text-center", "border-dark"];
            if (cell === props.highlightedCell) {
                classes.push('bg-light');
            }
            if(col < board[row].length - 1) {
                classes.push("border-right");
            }
            if(row < board.length - 1) {
                classes.push("border-bottom");
            }
            if(board[row][col] === 'O') {
                classes.push('text-primary');
            } else {
                classes.push('text-danger');
            }
            rowCols.push((
                <Col
                    key={cell}
                    className={classes.join(' ')}
                    onMouseEnter={() => props.cellEnter(cell)}
                    onMouseLeave={() => props.cellExit(cell)}
                    onClick={() => props.cellClick(cell)}>
                    <h1>{board[row][col]}</h1>
                </Col>
            ))
        }
        boardRows.push((
            <Row key={row}>
                {rowCols}
            </Row>
        ));
    }
    return boardRows;
};

export default board;
