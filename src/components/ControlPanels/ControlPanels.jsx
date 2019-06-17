import React, { Component } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';

import joystickImage from './../../../images/joystick.png';

import { CONTROLS } from '../../../ui';
import { ControllerDataset } from '../../../controller_dataset';
import * as ui from '../../../ui';
import { Webcam } from '../../../webcam';

import Status from './Status';
import ControlButton from './ControlButton';
import Dropdown from './Dropdown';
import PanelCell from './PanelCell';
import WebcamBox from '../WebcamBox';

const totals = [0, 0, 0, 0];
const NUM_CLASSES = 4;
const DEFAULT_STATUS_LABEL = 'train model';
const PLAY_BUTTON_LABEL_TEXT = 'play';

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
        this.loadTruncatedMobileNet = this.loadTruncatedMobileNet.bind(this);

        this.state = {
            isLoading: true,
            isPredicting: false,
            isWebcamFailed: false,
            statusLabel: DEFAULT_STATUS_LABEL,
        };

        this.controllerDataset = new ControllerDataset(NUM_CLASSES);
        this.webcam = React.createRef();
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
                const img = this.webcam.current.capture();
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
            const img = this.webcam.current.capture();
            this.controllerDataset.addExample(truncatedMobileNet.predict(img), label);

            ui.drawThumb(img, label);
        });

        document.body.setAttribute('data-active', CONTROLS[label]);
        total.innerText = ++totals[label];
        await tf.nextFrame();

        document.body.removeAttribute('data-active');
    }

    async loadTruncatedMobileNet() {
        const mobilenet = await tf.loadLayersModel(
            'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
        );

        const layer = mobilenet.getLayer('conv_pw_13_relu');
        return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
    }

    async componentDidMount() {
        const webcam = new Webcam(this.webcam.current);

        try {
            await webcam.setup();
        } catch (e) {
            this.handleWebcamFail();
        }

        truncatedMobileNet = await this.loadTruncatedMobileNet();

        tf.tidy(() => truncatedMobileNet.predict(webcam.capture()));

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
                <Status isLoading={isLoading} />

                {!isWebcamFailed && (
                    <ControlPanelsElement isLoading={isLoading}>
                        <PanelElement>
                            <PanelRowElement>
                                <ControlButton onClickHandler={this.trainClickHandler} label={statusLabel} />
                                <ControlButton
                                    onClickHandler={this.predictClickHandler}
                                    label={PLAY_BUTTON_LABEL_TEXT}
                                />
                            </PanelRowElement>

                            <PanelRowElement>
                                <ParamsElement>
                                    <Dropdown
                                        label="Learning rate"
                                        selectID="learningRate"
                                        values={[0.00001, 0.0001, 0.01, 0.03]}
                                        selectedValue="0.0001"
                                    />

                                    <Dropdown
                                        label="Batch size"
                                        selectID="batchSizeFraction"
                                        values={[0.05, 0.1, 0.4, 1]}
                                    />

                                    <Dropdown label="Epochs" selectID="epochs" values={[10, 20, 40]} />

                                    <Dropdown label="Hidden units" selectID="dense-units" values={[10, 100, 200]} />
                                </ParamsElement>

                                <WebcamBox ref={this.webcam} />
                            </PanelRowElement>
                        </PanelElement>

                        <PanelElement>
                            <PanelRowElement>
                                <PanelCell side="up" onMouseDown={() => this.handler(0)} />
                            </PanelRowElement>
                            <PanelRowElement>
                                <PanelCell side="left" onMouseDown={() => this.handler(2)} />

                                <img height="108" width="129" src={joystickImage} />

                                <PanelCell side="right" onMouseDown={() => this.handler(3)} />
                            </PanelRowElement>

                            <PanelRowElement>
                                <PanelCell side="down" onMouseDown={() => this.handler(1)} />
                            </PanelRowElement>
                        </PanelElement>
                    </ControlPanelsElement>
                )}
            </ControlsWrapper>
        );
    }
}

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const ControlPanelsElement = styled.div`
    display: flex;
    flex-direction: row;
    margin: 9px auto 0;
    ${props => props.isLoading && 'visibility: hidden;'}

    & button {
        background: none;
        border: none;
        box-sizing: border-box;
        cursor: pointer;
        margin: 0;
        padding: 0;
    }
`;

const PanelElement = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;

    &:first-child {
        border-right: 1px dashed #565656;
        padding: 0 22px 0 13px;
        width: 396px;
    }

    &:last-child {
        padding: 0 9px 0 22px;
        width: 353px;
    }
`;

const PanelRowElement = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
`;

const ParamsElement = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 12px;
`;

export default ControlPanels;
