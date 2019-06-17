import React, { Component } from 'react';
import styled from 'styled-components';

import Header from './Header';
import GameContainer from './GameContainer';
import ControlPanels from './ControlPanels/ControlPanels';

export default class App extends Component {
    constructor() {
        super();

        this.onWebcamFail = this.onWebcamFail.bind(this);
        this.state = {
            isWebcamFailed: false,
        };
    }

    loadScript() {
        const script = document.createElement('script');
        script.src = 'https://storage.googleapis.com/tfjs-examples/assets/webcam-transfer-learning/pacman-google.js';
        script.async = true;

        document.body.appendChild(script);
    }

    componentDidMount() {
        this.loadScript();
    }

    onWebcamFail() {
        this.setState({ isWebcamFailed: true });
    }

    render() {
        const { isWebcamFailed } = this.state;

        return (
            <AppElement>
                <Header isWebcamFailed={isWebcamFailed} />
                <GameContainer />
                <ControlPanels isWebcamFailed={isWebcamFailed} onWebcamFail={this.onWebcamFail} />
            </AppElement>
        );
    }
}

const AppElement = styled.div`
    display: flex;
    flex-direction: column;
    background: #2a2a2a;
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
`;
