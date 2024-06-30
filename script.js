const canvas = document.getElementById("gameboard");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bounceAudio = new Audio("SourceFiles/BounceSound.mp3");
const looseAudio = new Audio("SourceFiles/GameOverSound.mp3");
const victoryAudio = new Audio("SourceFiles/VictoryAudio.mp3");

bounceAudio.playbackRate = 1.3;
victoryAudio.playbackRate = 1.05;
victoryAudio.volume = 0.45;

let lastTime = 0;
let currentWinner = undefined;
let isActive = false;
let isRoundOver = false;
let isGameOver = false;

const pong = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    flySpeedX: 6.5 + canvas.width / 2.35 + Math.random() * 16.5,
    flySpeedY: 6.3 + canvas.height / 1.7 + Math.random() * 14.75,
    radius: 15,    
}

const bar = {
    width: 20,
    height: canvas.height / 5.2,
    moveSpeed: canvas.height / 1.85,
    margin: 15
};

const arrowBtns = document.querySelectorAll(".control-button");

const scoreDisplayPlayer1 = document.getElementById("scoreDisplayPlayer1");
const scoreDisplayPlayer2 = document.getElementById("scoreDisplayPlayer2");

let scorePlayer1 = 0;
let scorePlayer2 = 0;

let yPosPlayer1 = canvas.height / 2 - bar.height / 2;
let yPosPlayer2 = canvas.height / 2 - bar.height / 2;

let dyPlayer1 = 0;
let dyPlayer2 = 0;

window.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    loadOpenningMessage();
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    bar.height = canvas.height / 5.1;
    bar.moveSpeed = canvas.height / 1.85;

    resetRound();
    initializeGame();
});

window.addEventListener("keydown", (e) => {
    if(isActive){
        if(e.key == "W" || e.key == "w"){
            dyPlayer1 = -1;
        }
        if(e.key == "S" || e.key == "s"){
            dyPlayer1 = 1;
        }
        if(e.key == "ArrowUp"){
            dyPlayer2 = -1;
        }
        if(e.key == "ArrowDown"){
            dyPlayer2 = 1;
        }
    }
});

window.addEventListener("keyup", (e) => {
    if(isActive){
        if(isActive){
            if(e.key == "W" || e.key == "w"){
                dyPlayer1 = 0;
            }
            if(e.key == "S" || e.key == "s"){
                dyPlayer1 = 0;
            }
            if(e.key == "ArrowUp"){
                dyPlayer2 = 0;
            }
            if(e.key == "ArrowDown"){
                dyPlayer2 = 0;
            }
        }
    }
});


arrowBtns.forEach((arrowBtn) => {
    arrowBtn.addEventListener("pointerdown", (e) => {
        const btn = e.currentTarget;
        console.log(btn.name, btn.value)
        if(isActive){
            if(btn.name == "player1" && btn.value == "up"){
                dyPlayer1 = -1;
            }
            if(btn.name == "player1" && btn.value == "down"){
                dyPlayer1 = 1;
            }
            if(btn.name == "player2" && btn.value == "up"){
                dyPlayer2 = -1;
            }
            if(btn.name == "player2" && btn.value == "down"){
                dyPlayer2 = 1;
            }
        }
    });
});

arrowBtns.forEach((arrowBtn) => {
    arrowBtn.addEventListener("pointerup", (e) => {
        const btn = e.currentTarget;
        if(isActive){
            if(btn.name == "player1" && btn.value == "up"){
                dyPlayer1 = 0;
            }
            if(btn.name == "player1" && btn.value == "down"){
                dyPlayer1 = 0;
            }
            if(btn.name == "player2" && btn.value == "up"){
                dyPlayer2 = 0;
            }
            if(btn.name == "player2" && btn.value == "down"){
                dyPlayer2 = 0;
            }
        }
    });
    
    arrowBtn.addEventListener("pointerleave", (e) => {
        const btn = e.currentTarget;
        if(isActive){
            if(btn.name == "player1" && btn.value == "up"){
                dyPlayer1 = 0;
            }
            if(btn.name == "player1" && btn.value == "down"){
                dyPlayer1 = 0;
            }
            if(btn.name == "player2" && btn.value == "up"){
                dyPlayer2 = 0;
            }
            if(btn.name == "player2" && btn.value == "down"){
                dyPlayer2 = 0;
            }
        }
    });
});


function loadOpenningMessage(){
    const openningDiv = document.createElement("div");
    const h2 = document.createElement("h2");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    const button = document.createElement("button");

    openningDiv.classList.add("message-wrapper");

    h2.textContent = "Pong";
    p1.textContent = "Spiele Pong gemeinsam mit deinen Freunden.";
    p2.textContent = "Wer zuerst 5 Punkte erreicht, gewinnt!";
    button.textContent = "Spielen";

    button.addEventListener("pointerdown", () => {
        document.body.removeChild(openningDiv);
        
        setTimeout(() => {
            isActive = true;
            lastTime = performance.now();
            requestAnimationFrame(handleGame);
        }, 500);
    });

    openningDiv.appendChild(h2);
    openningDiv.appendChild(p1);
    openningDiv.appendChild(p2);
    openningDiv.appendChild(button);

    document.body.appendChild(openningDiv);
}

function loadRoundOverMessage(roundWinner){
    const roundOverDiv = document.createElement("div");
    const h2 = document.createElement("h2");
    const p = document.createElement("p");
    const button = document.createElement("button");
    
    roundOverDiv.classList.add("message-wrapper");

    h2.textContent = "Pong";
    p.innerHTML = `<b>${roundWinner}</b> hat die Runde gewonnen!`;
    button.textContent = "Weiter";

    button.addEventListener("pointerdown", () => {
        isRoundOver = false;
        document.body.removeChild(roundOverDiv);
        resetRound();
        
        setTimeout(() => {
            isActive = true;
            lastTime = performance.now();
            requestAnimationFrame(handleGame);
        }, 500);
    });

    roundOverDiv.appendChild(h2);
    roundOverDiv.appendChild(p);
    roundOverDiv.appendChild(button);

    document.body.appendChild(roundOverDiv);
}

function loadGameOverMessage(gameWinner){
    const gameOverDiv = document.createElement("div");
    const h2 = document.createElement("h2");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    const button = document.createElement("button");

    gameOverDiv.classList.add("message-wrapper");

    h2.textContent = "Pong";
    p1.innerHTML = `Glückwunsch, <b>${gameWinner}</b> hat das Spiel gewonnen!`;
    p2.textContent = "Wenn du noch ein Spiel spielen möchtest, klicke auf Neustarten.";
    button.textContent = "Neustarten";

    button.addEventListener("pointerdown", () => {
        isGameOver = false;
        document.body.removeChild(gameOverDiv);
        resetRound();
        resetGame();
        loadOpenningMessage();
    });

    gameOverDiv.appendChild(h2);
    gameOverDiv.appendChild(p1);
    gameOverDiv.appendChild(p2);
    gameOverDiv.appendChild(button);

    document.body.appendChild(gameOverDiv);
}

function initializeGame(){
    drawPong();
    drawPlayers();
}

function handleGame(timeStamp){
    const deltaTime = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;
    console.log(deltaTime)

    if(isGameOver){
        loadGameOverMessage(currentWinner);
    } else if(isRoundOver){
        loadRoundOverMessage(currentWinner);
    } else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        calculatePong(deltaTime);
        drawPong();
        calculatePlayers(deltaTime);
        drawPlayers();
        checkPongBorderCollision();
        checkPongPlayerCollision();
        requestAnimationFrame(handleGame);
    }
}

function calculatePong(deltaT){
    pong.x += pong.flySpeedX * deltaT;
    pong.y += pong.flySpeedY * deltaT;
}

function drawPong(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(pong.x, pong.y, pong.radius, 0, Math.PI * 2);
    ctx.fill();
}

function calculatePlayers(deltaT){
    yPosPlayer1 += dyPlayer1 * bar.moveSpeed * deltaT;
    yPosPlayer2 += dyPlayer2 * bar.moveSpeed * deltaT;

    if(yPosPlayer1 <= 0){
        yPosPlayer1 = 0;
    } else if(yPosPlayer1 + bar.height >= canvas.height){
        yPosPlayer1 = canvas.height - bar.height; 
    }

    if(yPosPlayer2 <= 0){
        yPosPlayer2 = 0;
    } else if(yPosPlayer2 + bar.height >= canvas.height){
        yPosPlayer2 = canvas.height - bar.height;
    }
}

function drawPlayers(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(bar.margin, yPosPlayer1, bar.width, bar.height);

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width - bar.margin - bar.width, yPosPlayer2, bar.width, bar.height);
}

function checkPongBorderCollision(){
    if(pong.y - pong.radius <= 0 || pong.y + pong.radius >= canvas.height){
        pong.flySpeedY *= -1;
        bounceAudio.currentTime = 0;
        bounceAudio.play();
    }
    
    if(pong.x <= 0){
        currentWinner = "Spieler 2";
        scorePlayer2++;
        scoreDisplayPlayer2.textContent = `${scorePlayer2} Punkte`;

        if(scorePlayer2 === 5){
            isGameOver = true;
            victoryAudio.play();
        } else{
            isRoundOver = true;
            looseAudio.play();
        }

    } else if(pong.x >= canvas.width){
        currentWinner = "Spieler 1";
        scorePlayer1++;
        scoreDisplayPlayer1.textContent = `${scorePlayer1} Punkte`;
        
        if(scorePlayer1 === 5){
            isGameOver = true;
            isActive = false;
            victoryAudio.play();
        } else{
            isRoundOver = true;
            isActive = false;
            looseAudio.play();
        }
    }
}

function checkPongPlayerCollision(){
    if((pong.x - pong.radius <= bar.margin + bar.width && (pong.y >= yPosPlayer1 && pong.y <= yPosPlayer1 + bar.height)) || (pong.x + pong.radius >= canvas.width - bar.width - bar.width && (pong.y >= yPosPlayer2 && pong.y <= yPosPlayer2 + bar.height))){
        pong.flySpeedX *= -1;
        bounceAudio.currentTime = 0;
        bounceAudio.play();
    }
}

function resetRound(){
    dyPlayer1 = 0;
    dyPlayer2 = 0;

    yPosPlayer1 = canvas.height / 2 - bar.height / 2;
    yPosPlayer2 = canvas.height / 2 - bar.height / 2;

    pong.x = canvas.width / 2;
    pong.y = canvas.height / 2;

    const yDirection = Math.random() <= 0.5 ? -1 : 1;

    pong.flySpeedX = 6.5 + canvas.width / 2.45 + Math.random() * 17.5;
    pong.flySpeedY = (6.3 + canvas.width / 2.55 + Math.random() * 15.25) * yDirection;

    if(currentWinner == "Spieler 1"){
        pong.flySpeedX *= -1;
    }
}

function resetGame(){
    currentWinner = undefined;
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    scoreDisplayPlayer1.textContent = `${scorePlayer1} Punkte`;
    scoreDisplayPlayer2.textContent = `${scorePlayer2} Punkte`;
}