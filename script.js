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

let actionQueue = []; 
let currentActionIndex = 0;
let hasTimerStarted = false;

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
    const action = { type: actionType, duration, originalDuration: duration, completed: false };
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
        queueItem.draggable = true;
        queueItem.addEventListener('dragstart', handleDragStart);
        queueItem.addEventListener('dragover', handleDragOver);
        queueItem.addEventListener('drop', handleDrop);

        if (hasTimerStarted && index === currentActionIndex) {
            queueItem.classList.add('active');
        } else {
            queueItem.classList.remove('active');
        }
        if (action.completed) {
            queueItem.classList.add('complete');
        }

        const dragHandle = document.createElement('span');
        dragHandle.classList.add('material-icons', 'drag-action');
        dragHandle.textContent = 'drag_handle';
        queueItem.appendChild(dragHandle);

        const textContent = document.createElement('span');
        textContent.textContent = `${Math.floor(action.duration / 1000)} SEC ${action.type.toUpperCase()}`;
        queueItem.appendChild(textContent);

        const removeBtn = document.createElement('span');
        removeBtn.classList.add('material-icons', 'remove-action');
        removeBtn.innerHTML = 'delete';
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
    if (currentAction && typeof currentAction.start === 'number') {
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
        timerPath.style.strokeDashoffset = 565; // 
        timerPath.style.stroke = 'transparent';
        timeDisplay.textContent = '00:00:00';
        totalMilliseconds = 0;
        isPaused = false;
        hasTimerStarted = false;
        actionQueue.forEach(action => {
            action.completed = true; // Mark all actions as complete when queue runs out
            action.start = undefined;
        });
        currentActionIndex = 0; // Reset the index of the current action
        renderQueue(); // Re-render the queue display
        startBtn.textContent = 'START'; // Reset the start button text
        stopBtn.style.display = 'none'; // Hide the stop button
    }
}

function manageTimer(action) {
    if (timer) {
        clearInterval(timer);
    }
    timer = setInterval(() => {
        totalMilliseconds += 10;
        updateTimerDisplay();
        if (totalMilliseconds - action.start >= action.duration) {
            completeAction();
        }
    }, 10);
}

function completeAction() {
    const action = actionQueue[currentActionIndex];
    action.completed = true;
    if (currentActionIndex < actionQueue.length - 1) {
        currentActionIndex++;
        startTimer();  // Start next action
    } else {
        const repeatQueue = document.getElementById('repeat-queue').checked;
        if (repeatQueue) {
            resetTimer(); // Reset the timer to start from the first action
            startTimer(); // Start the timer again from the first action
        } else {
            stopTimer(); // Stop the timer if repeat is not checked
        }
    }
    renderQueue(); 
}

function resetTimer() {
    startBtn.textContent = 'START';
    stopBtn.style.display = 'none';
    totalMilliseconds = 0;
    currentActionIndex = 0;
    isPaused = false;
    hasTimerStarted = false;
    actionQueue.forEach(action => {
        action.completed = false;
        action.start = undefined;
    });
    renderQueue();
    updateTimerDisplay();
}

function startTimer() {
    if (!hasTimerStarted) {
        actionQueue.forEach(action => {
            action.completed = false;
            action.start = undefined;
        });
    }
    hasTimerStarted = true;
    startBtn.textContent = 'PAUSE';
    stopBtn.style.display = 'block';
    const currentAction = actionQueue[currentActionIndex];
    if (!currentAction.start) {
        currentAction.start = totalMilliseconds;
    }
    manageTimer(currentAction);
    renderQueue();
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
    startBtn.textContent = 'RESUME';
    isPaused = true;
    const currentAction = actionQueue[currentActionIndex];
    const elapsed = totalMilliseconds - currentAction.start;
    currentAction.remaining = currentAction.duration - elapsed;
    currentAction.strokeDashoffset = timerPath.style.strokeDashoffset;
}

function resumeTimer() {
    startBtn.textContent = 'PAUSE';
    isPaused = false;
    const currentAction = actionQueue[currentActionIndex];
    currentAction.start = totalMilliseconds - (currentAction.duration - currentAction.remaining);
    manageTimer(currentAction);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    startBtn.textContent = 'START';
    startBtn.classList.remove('paused');
    stopBtn.style.display = 'none';
    totalMilliseconds = 0;
    currentActionIndex = 0;
    isPaused = false;
    actionQueue.forEach(action => {
        action.completed = false;
        action.start = undefined;
        action.elapsedTime = 0;
    });
    renderQueue();
    updateTimerDisplay();
    timerPath.style.strokeDashoffset = 565;
    timeDisplay.textContent = '00:00:00';
    hasTimerStarted = false;
}

function toggleRepeatQueue(event) {
    const checkbox = document.getElementById('repeat-queue');
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked; // Toggle the state of the checkbox
    }
    const repeatQueueDiv = checkbox.closest('.repeat-queue-container');
    if (checkbox.checked) {
        repeatQueueDiv.classList.add('checked');
    } else {
        repeatQueueDiv.classList.remove('checked');
    }
}


startBtn.addEventListener('click', () => {
    if (!timer && actionQueue.length > 0 && !isPaused) {
        startTimer();
    } else if (timer && !isPaused) {
        pauseTimer();
    } else if (!timer && isPaused) {
        resumeTimer();
    }
});

stopBtn.addEventListener('click', stopTimer);

document.querySelector('.repeat-queue-container').addEventListener('click', toggleRepeatQueue);
document.querySelector('.repeat-queue-container label').addEventListener('click', toggleRepeatQueue);

updateTimerDisplay();