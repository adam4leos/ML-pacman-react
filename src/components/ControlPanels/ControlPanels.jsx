import React, { Component } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';

import joystickImage from './../../../images/joystick.png';
import pointerImage from './../../../images/pointer.svg';

import { CONTROLS } from '../../../ui';
import { ControllerDataset } from '../../../controller_dataset';
import * as ui from '../../../ui';
import { Webcam } from '../../../webcam';

import Status from './Status';
import ControlButton from './ControlButton';
import Dropdown from './Dropdown';

const totals = [0, 0, 0, 0];
const NUM_CLASSES = 4;
const DEFAULT_STATUS_LABEL = 'train model';

let isPredicting = false;
let truncatedMobileNet;
let model;

class ControlPanels extends Component {
    constructor() {
        super();

        this.handler = this.handler.bind(this);
        this.trainClickHandler = this.trainClickHandler.bind(this);
        this.predictClickHandler = this.predictClickHandler.bind(this);
        this.train = this.train.bind(this);
        this.predict = this.predict.bind(this);
        this.handleWebcamFail = this.handleWebcamFail.bind(this);
        this.changeStatusLabel = this.changeStatusLabel.bind(this);

        this.state = {
            isLoading: true,
            isPredicting: false,
            isWebcamFailed: false,
            statusLabel: DEFAULT_STATUS_LABEL,
        };

        this.controllerDataset = new ControllerDataset(NUM_CLASSES);
        this.webcam = null;
    }

    async train() {
        const { xs, ys } = this.controllerDataset;

        if (xs == null) {
            alert('Add some examples before training!');
            this.changeStatusLabel(DEFAULT_STATUS_LABEL);
            return;
        }

        model = tf.sequential({
            layers: [
                tf.layers.flatten({ inputShape: truncatedMobileNet.outputs[0].shape.slice(1) }),
                tf.layers.dense({
                    units: Number(document.getElementById('dense-units').value),
                    activation: 'relu',
                    kernelInitializer: 'varianceScaling',
                    useBias: true,
                }),
                tf.layers.dense({
                    units: NUM_CLASSES,
                    kernelInitializer: 'varianceScaling',
                    useBias: false,
                    activation: 'softmax',
                }),
            ],
        });

        const optimizer = tf.train.adam(Number(document.getElementById('learningRate').value));

        model.compile({ optimizer: optimizer, loss: 'categoricalCrossentropy' });

        const batchSize = Math.floor(xs.shape[0] * Number(document.getElementById('batchSizeFraction').value));

        if (!(batchSize > 0)) {
            throw new Error(`Batch size is 0 or NaN. Please choose a non-zero fraction.`);
        }

        model.fit(xs, ys, {
            batchSize,
            epochs: Number(document.getElementById('epochs').value),
            callbacks: {
                onBatchEnd: async (batch, logs) => {
                    const newStatusLabel = `Loss: ${logs.loss.toFixed(5)}`;

                    this.changeStatusLabel(newStatusLabel);
                },
            },
        });
    }

    changeStatusLabel(newLabel) {
        this.setState({ statusLabel: newLabel });
    }

    async predict() {
        this.setState({ isPredicting: true });

        while (isPredicting) {
            const predictedClass = tf.tidy(() => {
                const img = this.webcam.capture();
                const embeddings = truncatedMobileNet.predict(img);
                const predictions = model.predict(embeddings);

                return predictions.as1D().argMax();
            });

            const classId = (await predictedClass.data())[0];
            predictedClass.dispose();

            ui.predictClass(classId);
            await tf.nextFrame();
        }

        this.setState({ isPredicting: false });
    }

    async handler(label) {
        const className = CONTROLS[label];
        const button = document.getElementById(className);
        const total = document.getElementById(className + '-total');

        tf.tidy(() => {
            const img = this.webcam.capture();
            this.controllerDataset.addExample(truncatedMobileNet.predict(img), label);

            ui.drawThumb(img, label);
        });

        document.body.setAttribute('data-active', CONTROLS[label]);
        total.innerText = ++totals[label];
        await tf.nextFrame();

        document.body.removeAttribute('data-active');
    }

    async componentDidMount() {
        this.webcam = new Webcam(document.getElementById('webcam'));

        async function loadTruncatedMobileNet() {
            const mobilenet = await tf.loadLayersModel(
                'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
            );

            const layer = mobilenet.getLayer('conv_pw_13_relu');
            return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
        }

        try {
            await this.webcam.setup();
        } catch (e) {
            this.handleWebcamFail();
        }

        truncatedMobileNet = await loadTruncatedMobileNet();

        tf.tidy(() => truncatedMobileNet.predict(this.webcam.capture()));

        this.setState({ isLoading: false });
    }

    handleWebcamFail() {
        const { onWebcamFail } = this.props;

        onWebcamFail && onWebcamFail();

        this.setState({ isWebcamFailed: true });
    }

    async trainClickHandler() {
        this.changeStatusLabel('Training...');

        await tf.nextFrame();
        await tf.nextFrame();

        isPredicting = false;

        this.train();
    }

    predictClickHandler() {
        ui.startPacman();
        isPredicting = true;
        this.predict();
    }

    render() {
        const { isLoading, isWebcamFailed, isPredicting, statusLabel } = this.state;

        return (
            <ControlsWrapper>
                {(isLoading || isPredicting) && <Status />}

                {!isWebcamFailed && (
                    <div className={`controller-panels ${isLoading && 'hidden'}`} id="controller">
                        <div className="panel training-panel">
                            <div className="panel-row big-buttons">
                                <ControlButton onClickHandler={this.trainClickHandler} label={statusLabel} />
                                <ControlButton onClickHandler={this.predictClickHandler} label="PLAY" />
                            </div>

                            <div className="panel-row params-webcam-row">
                                <div className="hyper-params">
                                    <Dropdown
                                        label="Learning rate"
                                        selectID="learningRate"
                                        values={[0.00001, 0.0001, 0.01, 0.03]}
                                    />

                                    <Dropdown
                                        label="Batch size"
                                        selectID="batchSizeFraction"
                                        values={[0.05, 0.1, 0.4, 1]}
                                    />

                                    <Dropdown label="Epochs" selectID="epochs" values={[10, 20, 40]} />

                                    <Dropdown label="Hidden units" selectID="dense-units" values={[10, 100, 200]} />
                                </div>

                                <div className="webcam-box-outer">
                                    <div className="webcam-box-inner">
                                        <video autoPlay playsInline muted id="webcam" width="224" height="224" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="panel joystick-panel">
                            <div className="panel-row panel-row-top">
                                <div className="panel-cell panel-cell-left panel-cell-fill">
                                    <p className="help-text">
                                        Click to add the <br />
                                        current camera <br />
                                        view as an example <br />
                                        for that control
                                    </p>
                                </div>

                                <div className="panel-cell panel-cell-center">
                                    <div className="thumb-box">
                                        <div className="thumb-box-outer">
                                            <div className="thumb-box-inner">
                                                <canvas className="thumb" width="224" height="224" id="up-thumb" />
                                            </div>
                                            <button className="record-button" onMouseDown={() => this.handler(0)}>
                                                <span>Add Sample</span>
                                            </button>
                                        </div>
                                        <p>
                                            <span id="up-total">0</span> examples
                                        </p>
                                    </div>
                                </div>

                                <div className="panel-cell panel-cell-right panel-cell-fill" />
                            </div>
                            <div className="panel-row panel-row-middle">
                                <div className="panel-cell panel-cell-left">
                                    <div className="thumb-box">
                                        <div className="thumb-box-outer">
                                            <div className="thumb-box-inner">
                                                <canvas className="thumb" width="224" height="224" id="left-thumb" />
                                            </div>
                                            <button className="record-button" onMouseDown={() => this.handler(2)}>
                                                <span>Add Sample</span>
                                            </button>
                                        </div>
                                        <p>
                                            <span id="left-total">0</span> examples
                                        </p>
                                    </div>
                                </div>

                                <div className="panel-cell panel-cell-center panel-cell-fill">
                                    <img height="108" width="129" src={joystickImage} />
                                </div>

                                <div className="panel-cell panel-cell-right">
                                    <div className="thumb-box">
                                        <div className="thumb-box-outer">
                                            <div className="thumb-box-inner">
                                                <canvas className="thumb" width="224" height="224" id="right-thumb" />
                                            </div>
                                            <button className="record-button" onMouseDown={() => this.handler(3)}>
                                                <span>Add Sample</span>
                                            </button>
                                        </div>
                                        <p>
                                            <span id="right-total">0</span> examples
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="panel-row panel-row-bottom">
                                <div className="panel-cell panel-cell-left panel-cell-fill" />

                                <div className="panel-cell panel-cell-center">
                                    <div className="thumb-box">
                                        <div className="thumb-box-outer">
                                            <div className="thumb-box-inner">
                                                <canvas className="thumb" width="224" height="224" id="down-thumb" />
                                            </div>
                                            <button className="record-button" onMouseDown={() => this.handler(1)}>
                                                <span>Add Sample</span>
                                            </button>
                                        </div>
                                        <p>
                                            <span id="down-total">0</span> examples
                                        </p>
                                    </div>
                                </div>

                                <div className="panel-cell panel-cell-right panel-cell-fill" />
                            </div>
                        </div>
                    </div>
                )}
            </ControlsWrapper>
        );
    }
}

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export default ControlPanels;
