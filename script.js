let milliseconds = 0;
let totalMilliseconds = milliseconds;
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
let totalRestMilliseconds = restMilliseconds;
let isResting = false;
let intervalCount = 1;

let actionQueue = []; // Initialize the queue
let currentActionIndex = 0; // Track the current action index

document.getElementById('add-action').addEventListener('click', () => {
    const actionType = document.getElementById('action-toggle').checked ? 'rest' : 'hang';
    const actionTime = document.getElementById('action-time').value;
    const minutesSeconds = actionTime.split(':');
    const minutes = parseInt(minutesSeconds[0], 10) || 0;
    const seconds = parseInt(minutesSeconds[1], 10) || 0;
    const duration = (minutes * 60 + seconds) * 1000;
    actionQueue.push({ type: actionType, duration });

    const queueDisplay = document.getElementById('queue');
    const newQueueItem = document.createElement('div');
    newQueueItem.classList.add('queue-item');
    newQueueItem.textContent = `${actionType.toUpperCase()}: ${minutes.toString()}m ${seconds.toString().padStart(2, '0')}s`;
    queueDisplay.appendChild(newQueueItem);
});

function updateTimerDisplay() {
    let currentMilliseconds = isResting ? restMilliseconds : milliseconds;
    const minutes = Math.floor(currentMilliseconds / 60000);
    const secs = Math.floor((currentMilliseconds % 60000) / 1000);
    const millis = Math.floor((currentMilliseconds % 1000) / 10);
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`;

    const totalTime = isResting ? totalRestMilliseconds : totalMilliseconds;
    const progress = 1 - (currentMilliseconds / totalTime);
    const dashOffset = 565 - (565 * progress);
    document.getElementById('timer-path').style.strokeDashoffset = dashOffset;

    const timerPath = document.getElementById('timer-path');
    if (isResting) {
        timerPath.style.stroke = 'green';
    } else {
        timerPath.style.stroke = '#0963DA';
    }
}

function processNextAction() {
    if (currentActionIndex >= actionQueue.length) {
        if (document.getElementById('repeat-queue').checked) {
            currentActionIndex = 0; // Reset to the first action if repeat is checked
        } else {
            console.log('Queue completed.');
            stopTimer();
            return;
        }
    }

    const currentAction = actionQueue[currentActionIndex++];
    if (currentAction.type === 'hang') {
        isResting = false;
        milliseconds = currentAction.duration;
        totalMilliseconds = currentAction.duration;
    } else if (currentAction.type === 'rest') {
        isResting = true;
        restMilliseconds = currentAction.duration;
        totalRestMilliseconds = currentAction.duration;
    }

    // Highlight the current action in the queue
    const queueItems = document.querySelectorAll('.queue-item');
    queueItems.forEach((item, index) => {
        if (index === currentActionIndex - 1) {
            item.innerHTML = `➡️ ${item.textContent}`; // Add an arrow to indicate the current action
        } else {
            item.textContent = item.textContent.replace('➡️ ', ''); // Remove arrow from other actions
        }
    });

    if (!timer) {
        startTimer();
    }
}

function startTimer() {
    if (isPaused) {
        isPaused = false;
        startBtn.textContent = 'PAUSE';
        stopBtn.style.display = 'none'; // Hide stop button when timer is resumed
    } else {
        timer = setInterval(() => {
            if (!isResting && milliseconds > 0) {
                milliseconds -= 10;
            } else if (isResting && restMilliseconds > 0) {
                restMilliseconds -= 10;
            } else {
                processNextAction(); // Move to the next action in the queue
            }
            updateTimerDisplay();
        }, 10);
        startBtn.textContent = 'PAUSE';
    }
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
    startBtn.textContent = 'START';
    stopBtn.style.display = 'none'; // Ensure stop button is hidden when timer is stopped
    milliseconds = 0;
    restMilliseconds = 0;
    updateTimerDisplay();
    isPaused = false;
    isResting = false;
    currentActionIndex = 0; // Reset the current action index
    // Optionally reset the actionQueue if needed
    // actionQueue = [];
}

startBtn.addEventListener('click', () => {
    if (startBtn.textContent === 'PAUSE') {
        clearInterval(timer);
        startBtn.textContent = 'START';
        isPaused = true;
        stopBtn.style.display = 'inline'; // Show stop button only when paused
    } else if (startBtn.textContent !== 'PAUS') { // Prevent action if button says "PAUS"
        startTimer();
    }
});
stopBtn.addEventListener('click', stopTimer);
updateTimerDisplay();

