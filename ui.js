import * as tf from '@tensorflow/tfjs';

export const CONTROLS = ['up', 'down', 'left', 'right'];
const CONTROL_CODES = [38, 40, 37, 39];

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;

export function startPacman() {
    google.pacman.startGameplay();
}

export function predictClass(classId) {
    google.pacman.keyPressed(CONTROL_CODES[classId]);
    document.body.setAttribute('data-active', CONTROLS[classId]);
}

export function isPredicting() {
    document.getElementById('status').style.visibility = 'visible';
}
export function donePredicting() {
    document.getElementById('status').style.visibility = 'hidden';
}
export function trainStatus(status) {
    document.getElementById('train-status').innerText = status;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
    addExampleHandler = handler;
}

const thumbDisplayed = {};

export function drawThumb(img, label) {
    if (thumbDisplayed[label] == null) {
        const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
        draw(img, thumbCanvas);
    }
}

export function draw(image, canvas) {
    const [width, height] = [224, 224];
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
        const j = i * 4;
        imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
        imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
        imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
        imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}
