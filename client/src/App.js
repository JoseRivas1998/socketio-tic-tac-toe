import React from 'react';
import {Container, Row} from 'react-bootstrap';

import Game from './containers/Game/Game';

function App() {
    return (
        <Container>
            <Row>
                <Game/>
            </Row>
        </Container>
    );
}

export default App;
