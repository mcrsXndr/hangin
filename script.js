let milliseconds = 0;
let totalMilliseconds = 0;
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.createElement('button');
stopBtn.textContent = 'STOP';
stopBtn.id = 'stop-btn';
document.querySelector('.timer-container').appendChild(stopBtn);
stopBtn.style.display = 'none'; // Initially hidden, will only show when paused
let timer = null;
let isPaused = false;

let restMilliseconds = 0;
let totalRestMilliseconds = 0;
let isResting = false;
let intervalCount = 1;

let actionQueue = []; // Initialize the queue
let currentActionIndex = 0; // Track the current action index

const addActionButtons = document.querySelectorAll('.add-action');
addActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        addAction(button.id.replace('add-', ''));
    });
});

function addAction(actionType) {
    const seconds = parseInt(document.getElementById('sec-input').value, 10) || 0;
    const duration = seconds * 1000;
    const action = { type: actionType, duration, completed: false };
    actionQueue.push(action);
    renderQueue();
}

function addDragAndDropHandlers(element) {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-index'));
    });

    element.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.target.style.border = '2px dashed #000'; // Visual feedback
    });

    element.addEventListener('dragleave', (e) => {
        e.target.style.border = 'none'; // Remove visual feedback
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        const originIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const targetIndex = parseInt(e.target.getAttribute('data-index'), 10);
        const targetRect = e.target.getBoundingClientRect();
        const dropPosition = (e.clientY - targetRect.top) < (targetRect.height / 2) ? 'before' : 'after';

        if (dropPosition === 'before' && originIndex !== targetIndex) {
            actionQueue.splice(targetIndex, 0, actionQueue.splice(originIndex, 1)[0]);
        } else if (dropPosition === 'after' && originIndex !== targetIndex + 1) {
            actionQueue.splice(targetIndex + 1, 0, actionQueue.splice(originIndex, 1)[0]);
        }

        renderQueue();
    });
}

function renderQueue() {
    const queueDisplay = document.getElementById('queue');
    queueDisplay.innerHTML = ''; // Clear existing items
    actionQueue.forEach((action, index) => {
        const queueItem = document.createElement('div');
        queueItem.classList.add('queue-item');
        queueItem.id = action.type;
        queueItem.textContent = `${action.type.toUpperCase()}: ${Math.floor(action.duration / 1000)}s`;
        queueItem.draggable = true;
        queueItem.setAttribute('data-index', index);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.classList.add('remove-action');
        removeBtn.onclick = () => {
            actionQueue.splice(index, 1);
            renderQueue();
        };
        queueItem.appendChild(removeBtn);

        addDragAndDropHandlers(queueItem);

        queueDisplay.appendChild(queueItem);
    });
}

updateTimerDisplay();