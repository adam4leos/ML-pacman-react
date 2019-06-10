import React, { Component } from 'react';

import Header from './Header';
import GameContainer from './GameContainer';
import ControlPanels from './ControlPanels';

export default class App extends Component {
    constructor() {
        super();

        this.state = {
            isWebcamFound: false,
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

    render() {
        const { isWebcamFound } = this.state;

        return (
            <div>
                <Header isWebcamFound={isWebcamFound} />
                <GameContainer />
                <ControlPanels isWebcamFound={isWebcamFound} />
            </div>
        );
    }
}
