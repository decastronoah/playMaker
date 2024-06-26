const imageCanvas = document.getElementById('imageCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const imageCtx = imageCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');

const mapList = document.getElementById('mapList');
const clearButton = document.getElementById('clear');
const eraseButton = document.getElementById('erase');
const drawButton = document.getElementById('draw');
const undoButton = document.getElementById('undo');
const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');

let drawing = false;
let erasing = false;
let brushColor = colorPicker.value;
let brushSize = sizePicker.value;
let undoStack = [];

const canvasSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
imageCanvas.width = canvasSize;
imageCanvas.height = canvasSize;
drawCanvas.width = canvasSize;
drawCanvas.height = canvasSize;

// Event Listeners
mapList.addEventListener('click', handleMapSelection);
clearButton.addEventListener('click', () => { saveState(); clearDrawings(); });
eraseButton.addEventListener('click', () => { erasing = true; });
drawButton.addEventListener('click', () => { erasing = false; });
undoButton.addEventListener('click', undo);
colorPicker.addEventListener('input', (e) => { brushColor = e.target.value; });
sizePicker.addEventListener('input', (e) => { brushSize = e.target.value; });

drawCanvas.addEventListener('mousedown', startDrawing);
drawCanvas.addEventListener('mouseup', stopDrawing);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('mouseout', stopDrawing);

// Functions
function handleMapSelection(e) {
    if (e.target.tagName === 'LI') {
        const mapName = e.target.getAttribute('data-map');
        loadMapImage(mapName);
    }
}

function loadMapImage(mapName) {
    const img = new Image();
    img.onload = function() {
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
        saveState();  // Save state after loading a new image
    }
    img.src = `images/${mapName}`;
}

function clearDrawings() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function startDrawing(e) {
    saveState();  // Save state at the beginning of a drawing action
    const rect = drawCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    drawing = true;
    draw(e);
}

function stopDrawing() {
    drawing = false;
    drawCtx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    const rect = drawCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    drawCtx.lineWidth = brushSize;
    drawCtx.lineCap = 'round';

    if (erasing) {
        drawCtx.strokeStyle = '#f0f0f0';
        drawCtx.globalCompositeOperation = 'destination-out';
    } else {
        drawCtx.strokeStyle = brushColor;
        drawCtx.globalCompositeOperation = 'source-over';
    }

    drawCtx.lineTo(mouseX, mouseY);
    drawCtx.stroke();
    drawCtx.beginPath();
    drawCtx.moveTo(mouseX, mouseY);
}

function saveState() {
    const state = drawCanvas.toDataURL();
    undoStack.push(state);
}

function undo() {
    if (undoStack.length > 0) {
        const lastState = undoStack.pop();
        const img = new Image();
        img.onload = function() {
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            drawCtx.drawImage(img, 0, 0, drawCanvas.width, drawCanvas.height);
        }
        img.src = lastState;
    }
}
