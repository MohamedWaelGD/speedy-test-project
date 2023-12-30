const REACT_HISTORY = 'REACT_HISTORY';
const MAX_COUNT_SEC = 5000;
const aside = document.querySelector('aside .container');
const main = document.querySelector('main');
const inputMain = main.querySelector('#input-main');
const resultMain = main.querySelector('#result-main');
var isPlaying = false;
var startTimer = '';
var isReady = false;
var update$ = null;
var timerOut$ = null;

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
        checkState();
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
        startRound();        
    }
}

function startRound() {
    console.log("Start Round");
    isPlaying = true;
    isReady = false;
    main.classList.remove('active');
    inputMain.classList.add('d-none');
    resultMain.classList.add('d-none');
    const randomTime = ((0.5 + Math.random()) * 1000) * 3;
    update$ = setTimeout(()=>{
        stopCount();
    }, randomTime);
}

function stopCount() {
    console.log("Count Stopped");
    isReady = true;
    startTimer = new Date();
    main.classList.add('active');
    timerOut$ = setTimeout(()=>{
        timeOut();
    }, MAX_COUNT_SEC);
}

function timeOut() {
    console.log("Timeout");
    isPlaying = false;
    main.classList.remove('active');
    inputMain.classList.remove('d-none');
    resultMain.classList.remove('d-none');
    inputMain.classList.add('d-block');
    resultMain.classList.add('d-block');
    clearInterval(timerOut$);
    clearInterval(update$);
    resultMain.innerHTML = `Failed, Timeout`;
}

function stopRound() {
    isPlaying = false;
    inputMain.classList.remove('d-none');
    resultMain.classList.remove('d-none');
    inputMain.classList.add('d-block');
    resultMain.classList.add('d-block');
    clearInterval(timerOut$);
    clearInterval(update$);
    
    const endTimer = new Date();
    if (!isReady) {
        resultMain.innerHTML = `Failed, Should click when screen is green`;
    } else {
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
    }
}

function saveLocal(time) {
    const historyList = getReactsLocal();
    historyList.unshift(time);
    localStorage.setItem(REACT_HISTORY, JSON.stringify(historyList));
}

function getReactsLocal() {
    let historyList = localStorage.getItem(REACT_HISTORY);
    if (!historyList) {
        return [];
    }

    historyList = JSON.parse(historyList);
    if (Array.isArray(historyList)) return historyList;
    return [historyList];
}

function clearReactsLocal() {
    localStorage.removeItem(REACT_HISTORY);
    loadHistory();
}