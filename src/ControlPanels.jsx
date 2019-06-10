import React, { Component } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';

import buttonImage from './../images/button.svg';
import joystickImage from './../images/joystick.png';
import pointerImage from './../images/pointer.svg';

import { CONTROLS, addExampleHandler } from '../ui';
import { ControllerDataset } from '../controller_dataset';
import * as ui from '../ui';
import { Webcam } from '../webcam';

const Status = () => <StatusElement>Loading mobilenet...</StatusElement>;
const StatusElement = styled.div`
    color: #f8f8f8;
    font-weight: 300;
    margin: 12px 0;
    text-align: center;
`;

const totals = [0, 0, 0, 0];
let isPredicting = false;
let truncatedMobileNet;
let model;

class ControlPanels extends Component {
    constructor() {
        super();

        this.state = { isLoading: true };
        this.handler = this.handler.bind(this);
        this.trainClickHandler = this.trainClickHandler.bind(this);
        this.predictClickHandler = this.predictClickHandler.bind(this);
        this.train = this.train.bind(this);
    }

    async train() {
        if (controllerDataset.xs == null) {
            throw new Error('Add some examples before training!');
        }

        model = tf.sequential({
            layers: [
                tf.layers.flatten({ inputShape: truncatedMobileNet.outputs[0].shape.slice(1) }),
                tf.layers.dense({
                    units: ui.getDenseUnits(),
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

        const optimizer = tf.train.adam(ui.getLearningRate());

        model.compile({ optimizer: optimizer, loss: 'categoricalCrossentropy' });

        const batchSize = Math.floor(controllerDataset.xs.shape[0] * ui.getBatchSizeFraction());
        if (!(batchSize > 0)) {
            throw new Error(`Batch size is 0 or NaN. Please choose a non-zero fraction.`);
        }

        model.fit(controllerDataset.xs, controllerDataset.ys, {
            batchSize,
            epochs: ui.getEpochs(),
            callbacks: {
                onBatchEnd: async (batch, logs) => {
                    ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
                },
            },
        });
    }

    async handler(label) {
        const className = CONTROLS[label];
        const button = document.getElementById(className);
        const total = document.getElementById(className + '-total');

        addExampleHandler(label);
        document.body.setAttribute('data-active', CONTROLS[label]);
        total.innerText = ++totals[label];
        await tf.nextFrame();

        document.body.removeAttribute('data-active');
    }

    async componentDidMount() {
        const NUM_CLASSES = 4;

        const webcam = new Webcam(document.getElementById('webcam'));
        const controllerDataset = new ControllerDataset(NUM_CLASSES);

        async function loadTruncatedMobileNet() {
            const mobilenet = await tf.loadLayersModel(
                'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
            );

            const layer = mobilenet.getLayer('conv_pw_13_relu');
            return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
        }

        ui.setExampleHandler(label => {
            tf.tidy(() => {
                const img = webcam.capture();
                controllerDataset.addExample(truncatedMobileNet.predict(img), label);

                // Draw the preview thumbnail.
                ui.drawThumb(img, label);
            });
        });

        async function predict() {
            ui.isPredicting();
            while (isPredicting) {
                const predictedClass = tf.tidy(() => {
                    const img = webcam.capture();
                    const embeddings = truncatedMobileNet.predict(img);
                    const predictions = model.predict(embeddings);

                    return predictions.as1D().argMax();
                });

                const classId = (await predictedClass.data())[0];
                predictedClass.dispose();

                ui.predictClass(classId);
                await tf.nextFrame();
            }
            ui.donePredicting();
        }

        let isWebcamFound = true;

        try {
            await webcam.setup();
        } catch (e) {
            isWebcamFound = false;
        } finally {
            this.setState({ isWebcamFound });
        }

        truncatedMobileNet = await loadTruncatedMobileNet();

        tf.tidy(() => truncatedMobileNet.predict(webcam.capture()));

        this.setState({ isLoading: false });
    }

    async trainClickHandler() {
        ui.trainStatus('Training...');
        await tf.nextFrame();
        await tf.nextFrame();
        isPredicting = false;
        this.train();
    }

    predictClickHandler() {
        ui.startPacman();
        isPredicting = true;
        predict();
    }

    render() {
        const { isLoading } = this.state;
        const { isWebcamFound } = this.props;

        return (
            <ControlsWrapper>
                {isWebcamFound && <Status />}

                <div className={`controller-panels ${isLoading && 'hidden'}`} id="controller">
                    <div className="panel training-panel">
                        <div className="panel-row big-buttons">
                            <button onClick={this.trainClickHandler}>
                                <img width="66" height="66" src={buttonImage} />
                                <span id="train-status">TRAIN MODEL</span>
                            </button>
                            <button onClick={this.predictClickHandler}>
                                <img width="66" height="66" src={buttonImage} />
                                <span>PLAY</span>
                            </button>
                        </div>

                        <div className="panel-row params-webcam-row">
                            <div className="hyper-params">
                                <div className="dropdown">
                                    <label>Learning rate</label>
                                    <div className="select">
                                        <select id="learningRate">
                                            <option value="0.00001">0.00001</option>
                                            <option selected value="0.0001">
                                                0.0001
                                            </option>
                                            <option value="0.01">0.001</option>
                                            <option value="0.03">0.003</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="dropdown">
                                    <label>Batch size</label>
                                    <div className="select">
                                        <select id="batchSizeFraction">
                                            <option value="0.05">0.05</option>
                                            <option value="0.1">0.1</option>
                                            <option selected value="0.4">
                                                0.4
                                            </option>
                                            <option value="1">1</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="dropdown">
                                    <label>Epochs</label>
                                    <div className="select">
                                        <select id="epochs">
                                            <option value="10">10</option>
                                            <option selected value="20">
                                                20
                                            </option>
                                            <option value="40">40</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="dropdown">
                                    <label>Hidden units</label>
                                    <div className="select">
                                        <select id="dense-units">
                                            <option value="10">10</option>
                                            <option selected value="100">
                                                100
                                            </option>
                                            <option value="200">200</option>
                                        </select>
                                    </div>
                                </div>
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
                                        <button className="record-button" id="up" onMouseDown={() => this.handler(0)}>
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
                                        <button className="record-button" id="left" onMouseDown={() => this.handler(2)}>
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
                                        <button
                                            className="record-button"
                                            id="right"
                                            onMouseDown={() => this.handler(3)}
                                        >
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
                                        <button className="record-button" id="down" onMouseDown={() => this.handler(1)}>
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
            </ControlsWrapper>
        );
    }
}

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export default ControlPanels;
