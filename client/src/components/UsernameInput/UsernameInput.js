import React from 'react';
import {Button, Col, Form, FormControl, InputGroup, Row} from 'react-bootstrap';

const usernameInput = (props) => (
    <Col className="text-center">
        <h2>Welcome! Please enter your name</h2>
        <Row>
            <Col xs={{span: 12, offset: 0}} md={{span: 6, offset: 3}}>
                <Form onSubmit={props.submit}>
                    <InputGroup>
                        <FormControl
                            type="text"
                            placeholder="Enter your Username"
                            value={props.username}
                            onChange={props.changed}/>
                            <InputGroup.Append>
                                <Button
                                    variant="info"
                                    type="submit"
                                    disabled={props.username.trim().length === 0}>Submit Username</Button>
                            </InputGroup.Append>
                    </InputGroup>
                </Form>
            </Col>
        </Row>
    </Col>
);

export default usernameInput;
