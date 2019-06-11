import React, { Component } from 'react';

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
            <div>
                <Header isWebcamFailed={isWebcamFailed} />
                <GameContainer />
                <ControlPanels isWebcamFailed={isWebcamFailed} onWebcamFail={this.onWebcamFail} />
            </div>
        );
    }
}
