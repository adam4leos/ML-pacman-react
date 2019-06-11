import * as tf from '@tensorflow/tfjs';

export const CONTROLS = ['up', 'down', 'left', 'right'];
const CONTROL_CODES = [38, 40, 37, 39];

export function startPacman() {
    google.pacman.startGameplay();
}

export function predictClass(classId) {
    google.pacman.keyPressed(CONTROL_CODES[classId]);
    document.body.setAttribute('data-active', CONTROLS[classId]);
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
