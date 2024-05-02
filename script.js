let milliseconds = 0;
let totalMilliseconds = 0;
const timeDisplay = document.getElementById('time');
const timerPath = document.getElementById('timer-path');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.createElement('button');
stopBtn.textContent = 'STOP';
stopBtn.id = 'stop-btn';
document.querySelector('.timer-container').appendChild(stopBtn);
stopBtn.style.display = 'none'; // Initially hidden, will only show when stopped
let timer = null;
let isPaused = false;

let actionQueue = []; // Initialize the queue
let currentActionIndex = 0; // Track the current action index
let hasTimerStarted = false; // Track if the timer has started at least once

const addActionButtons = document.querySelectorAll('.add-action');
addActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        addAction(button.id.replace('add-', ''));
    });
});

const secInput = document.getElementById('sec-input');
const decreaseSecBtn = document.getElementById('decrease-sec');
const increaseSecBtn = document.getElementById('increase-sec');

decreaseSecBtn.addEventListener('click', () => {
    let currentValue = parseInt(secInput.value, 10);
    if (currentValue > 1) {
        secInput.value = currentValue - 1;
    }
});

increaseSecBtn.addEventListener('click', () => {
    let currentValue = parseInt(secInput.value, 10);
    if (currentValue < 9999) {
        secInput.value = currentValue + 1;
    }
});

function addAction(actionType) {
    const seconds = parseInt(secInput.value, 10) || 1;
    const duration = seconds * 1000;
    const action = { type: actionType, duration, completed: false };
    actionQueue.push(action);
    renderQueue();
}

function renderQueue() {
    const queueDisplay = document.getElementById('queue');
    queueDisplay.innerHTML = ''; // Clear existing items
    actionQueue.forEach((action, index) => {
        const queueItem = document.createElement('div');
        queueItem.classList.add('queue-item');
        queueItem.id = action.type;
        queueItem.textContent = `${index + 1}. ${action.type.toUpperCase()}: ${Math.floor(action.duration / 1000)}s`;
        queueItem.draggable = true;
        queueItem.addEventListener('dragstart', handleDragStart);
        queueItem.addEventListener('dragover', handleDragOver);
        queueItem.addEventListener('drop', handleDrop);

        if (hasTimerStarted && index === currentActionIndex) {
            queueItem.classList.add('active');
        } else if (action.completed) {
            queueItem.classList.add('complete');
        }

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.classList.add('remove-action');
        removeBtn.onclick = () => {
            actionQueue.splice(index, 1);
            renderQueue();
        };
        queueItem.appendChild(removeBtn);

        queueDisplay.appendChild(queueItem);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const droppedOnId = e.target.id;
    const draggedIndex = actionQueue.findIndex(item => item.type === draggedId);
    const droppedOnIndex = actionQueue.findIndex(item => item.type === droppedOnId);
    const draggedItem = actionQueue[draggedIndex];
    actionQueue.splice(draggedIndex, 1);
    actionQueue.splice(droppedOnIndex, 0, draggedItem);
    renderQueue();
}

function updateTimerDisplay() {
    let currentAction = actionQueue[currentActionIndex];
    if (currentAction) {
        const elapsed = totalMilliseconds - currentAction.start;
        const remaining = currentAction.duration - elapsed;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const millis = Math.floor((remaining % 1000) / 10);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`;
        timeDisplay.textContent = formattedTime;
        const totalDuration = currentAction.duration;
        const dashOffset = (565 * remaining) / totalDuration;
        timerPath.style.strokeDashoffset = dashOffset;
        timerPath.style.stroke = currentAction.type === 'rest' ? 'green' : '#0963DA'; // Change color based on action type
    } else {
        timerPath.style.strokeDashoffset = 565; // Reset to full circle
        timerPath.style.stroke = 'transparent'; // Reset stroke when no timer is active
    }
}

startBtn.addEventListener('click', () => {
    if (!timer && actionQueue.length > 0) {
        hasTimerStarted = true; // Set hasTimerStarted to true when the timer starts
        renderQueue(); // Refresh the queue to highlight the first item as active
        if (!isPaused) {
            startBtn.textContent = 'PAUSE';
            const currentAction = actionQueue[currentActionIndex];
            if (!currentAction.start) {
                currentAction.start = totalMilliseconds;
            }
            timer = setInterval(() => {
                totalMilliseconds += 10;
                updateTimerDisplay();
                if (totalMilliseconds - currentAction.start >= currentAction.duration) {
                    clearInterval(timer);
                    timer = null;
                    currentAction.completed = true;
                    currentActionIndex++;
                    if (currentActionIndex < actionQueue.length) {
                        startBtn.click(); // Automatically start the next timer
                    } else {
                        if (document.getElementById('repeat-queue').checked) {
                            currentActionIndex = 0; // Reset to start of the queue
                            actionQueue.forEach(action => {
                                action.completed = false;
                                action.start = undefined; // Reset start time for each action
                            }); // Clear 'complete' classes and reset start times
                            startBtn.click(); // Restart the queue
                        } else {
                            startBtn.textContent = 'START';
                            stopBtn.style.display = 'none';
                            timerPath.style.strokeDashoffset = 565; // Reset to full circle
                        }
                    }
                    renderQueue();
                }
            }, 10);
            stopBtn.style.display = 'block';
        } else {
            isPaused = false;
            startBtn.textContent = 'PAUSE';
            timer = setInterval(() => {
                totalMilliseconds += 10;
                updateTimerDisplay();
                const currentAction = actionQueue[currentActionIndex];
                if (totalMilliseconds - currentAction.start >= currentAction.duration) {
                    clearInterval(timer);
                    timer = null;
                    currentAction.completed = true;
                    currentActionIndex++;
                    if (currentActionIndex < actionQueue.length) {
                        startBtn.click(); // Automatically start the next timer
                    } else {
                        if (document.getElementById('repeat-queue').checked) {
                            currentActionIndex = 0; // Reset to start of the queue
                            actionQueue.forEach(action => {
                                action.completed = false;
                                action.start = undefined; // Reset start time for each action
                            }); // Clear 'complete' classes and reset start times
                            startBtn.click(); // Restart the queue
                        } else {
                            startBtn.textContent = 'START';
                            stopBtn.style.display = 'none';
                            timerPath.style.strokeDashoffset = 565; // Reset to full circle
                        }
                    }
                    renderQueue();
                }
            }, 10);
        }
    } else if (timer) {
        clearInterval(timer);
        timer = null;
        startBtn.textContent = 'RESUME';
        isPaused = true;
    } 
});

stopBtn.addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    startBtn.textContent = 'START';
    stopBtn.style.display = 'none';
    totalMilliseconds = 0;
    currentActionIndex = 0;
    isPaused = false; // Reset the paused state when stopped
    actionQueue.forEach(action => {
        action.completed = false;
        action.start = undefined; // Reset start time for each action
    });
    renderQueue();
    updateTimerDisplay();
    timerPath.style.strokeDashoffset = 565; // Reset the visual timer to full circle
    timeDisplay.textContent = '00:00:00'; // Reset display to 00:00:00
});
updateTimerDisplay();