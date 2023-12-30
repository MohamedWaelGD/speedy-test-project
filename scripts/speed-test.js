const SPEED_HISTORY = 'SPEED_HISTORY';
const MAX_COUNT_MS = 20000; // 10 sec
const WARM_UP_SEC = 5;
const MAX_CLICKS = 8;
const aside = document.querySelector('aside .container');
const main = document.querySelector('main');
const inputMain = main.querySelector('#input-main');
const resultMain = main.querySelector('#result-main');
const circle = main.querySelector('#circle');
var isPlaying = false;
var startTimer = '';
var isReady = false;
var update$ = null;
var timerOut$ = null;
var isWarmUp = false;
var currentClicks = 0;

(function(){
    loadHistory();
    setUpMouse();
    setupKeyboardShortcut();
})()

function loadHistory() {
    aside.innerHTML = '';
    const historyList = getReactsLocal();
    for (let i = 0; i < historyList.length; i++) {
        addHistoryItem(historyList[i]);
    }
}

function addHistoryItem(text) {
    const p = document.createElement('p');
    if (text) {
        p.innerText = text;
    } else {
        p.innerText = '-';
    }
    aside.appendChild(p);
}

function setUpMouse() {
    main.addEventListener('click', (event) => {
        if (!isPlaying) {
            setupRound();
        }
    })
}

function setupKeyboardShortcut() {
    document.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            checkState();
            event.preventDefault();
        }
    })
}

function checkState() {
    if (isPlaying) {
        stopRound();
    } else {
        setupRound();
    }
}

function setupRound() {
    if (isWarmUp) return;
    let counter = WARM_UP_SEC;
    resultMain.classList.remove('d-none');
    inputMain.classList.add('d-none');
    resultMain.innerHTML = counter;
    isWarmUp = true;
    let interval$ = setInterval(()=>{
        counter -= 1;
        resultMain.innerHTML = counter;
        if (counter <= -1) {
            isWarmUp = false;
            startRound();
            clearInterval(interval$);
        }
    }, 1000);
}

function startRound() {
    console.log("Start Round");
    isPlaying = true;
    isReady = false;
    main.classList.add('active');
    inputMain.classList.add('d-none');
    resultMain.classList.add('d-none');
    circle.classList.remove('d-none');
    currentClicks = MAX_CLICKS;
    setCircleToRandomPoint();
    startTimer = new Date();
    timerOut$ = setTimeout(()=>{
        timeOut();
    }, MAX_COUNT_MS);
}

function onClickCircle() {
    currentClicks -= 1;
    if (currentClicks <= 0) {
        stopRound();
    } else {
        setCircleToRandomPoint();
    }
}

function timeOut() {
    console.log("Timeout");
    isPlaying = false;
    main.classList.remove('active');
    inputMain.classList.remove('d-none');
    resultMain.classList.remove('d-none');
    inputMain.classList.add('d-block');
    resultMain.classList.add('d-block');
    circle.classList.add('d-none');
    clearInterval(timerOut$);
    clearInterval(update$);
    resultMain.innerHTML = `Failed, Timeout`;
}

function stopRound() {
    const endTimer = new Date();
    setTimeout(()=>{
        isPlaying = false;
        inputMain.classList.remove('d-none');
        resultMain.classList.remove('d-none');
        inputMain.classList.add('d-block');
        resultMain.classList.add('d-block');
        circle.classList.add('d-none');
        clearInterval(timerOut$);
        clearInterval(update$);
        
        let differenceInMs = endTimer - startTimer;
        if (differenceInMs > 1000) {
            differenceInMs /= 1000;
            resultMain.innerHTML = `Your time (${differenceInMs.toFixed(2)}) sec!`;
            saveLocal(`${differenceInMs.toFixed(2)} sec`);
        } else {
            resultMain.innerHTML = `Your time (${differenceInMs.toFixed(2)}) ms!`;
            saveLocal(`${differenceInMs} ms`);
        }
        this.loadHistory();
    }, 50)
}

function saveLocal(time) {
    const historyList = getReactsLocal();
    historyList.unshift(time);
    localStorage.setItem(SPEED_HISTORY, JSON.stringify(historyList));
}

function getReactsLocal() {
    let historyList = localStorage.getItem(SPEED_HISTORY);
    if (!historyList) {
        return [];
    }

    historyList = JSON.parse(historyList);
    if (Array.isArray(historyList)) return historyList;
    return [historyList];
}

function clearReactsLocal() {
    localStorage.removeItem(SPEED_HISTORY);
    loadHistory();
}

function setCircleToRandomPoint() {
    const randomPoint = getRandomPoint();

    circle.style.top = `${randomPoint.y}px`;
    circle.style.left = `${randomPoint.x}px`;
    circle.style.scale = 0.8 + (Math.random() * 0.7);
    circle.classList.remove('circle-activate');
    circle.offsetWidth;
    circle.classList.add('circle-activate');
}

function getRandomPoint() {
    const rect = main.getBoundingClientRect();

    const randomX = Math.random() * (rect.width - 2 * 20) + 20;
    const randomY = Math.random() * (rect.height - 2 * 20) + 20;

    return { x: randomX, y: randomY };
}