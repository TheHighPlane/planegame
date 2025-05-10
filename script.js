const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const gameArea = document.getElementById('game-area');
const plane = document.getElementById('plane');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const victoryScreen = document.getElementById('victory-screen');
const victoryBtn = document.getElementById('victory-btn');

let score = 0;
let gameSpeed = 5;
let planePosition = 2; // 1, 2, or 3
let gameRunning = false;
let animationId;
let obstacles = [];
let clouds = [];
let lastObstacleTime = 0;
let obstacleInterval = 2000; 

const obstacleTypes = [
    { class: 'plane', speedMultiplier: 1, spawnChance: 0.4 },
    { class: 'bomb', speedMultiplier: 1.2, spawnChance: 0.3 },
    { class: 'rock', speedMultiplier: 0.8, spawnChance: 0.3 }
];

function initGame() {
    startScreen.style.display = 'none';
    gameArea.classList.remove('hidden');
    
    score = 0;
    gameSpeed = 5;
    planePosition = 2;
    obstacleInterval = 2000;
    updateScore();
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    
    clearGameElements();
    
    updatePlanePosition();
    
    gameRunning = true;
    lastObstacleTime = Date.now();
    gameLoop();
}

function clearGameElements() {
    obstacles.forEach(obstacle => {
        if (obstacle.element.parentNode) {
            gameArea.removeChild(obstacle.element);
        }
    });
    obstacles = [];
    
    clouds.forEach(cloud => {
        if (cloud.element.parentNode) {
            gameArea.removeChild(cloud.element);
        }
    });
    clouds = [];
}

function updatePlanePosition() {
    const laneWidth = gameArea.offsetWidth / 3;
    const newLeft = (planePosition - 1) * laneWidth + laneWidth / 2 - plane.offsetWidth / 2;
    plane.style.left = `${newLeft}px`;
    plane.style.top = `${gameArea.offsetHeight - plane.offsetHeight - 20}px`;
}

function gameLoop() {
    if (!gameRunning) return;
    
    obstacles.forEach((obstacle, index) => {
        obstacle.y += gameSpeed * obstacle.speed;
        obstacle.element.style.top = `${obstacle.y}px`;
        
        if (obstacle.y > gameArea.offsetHeight) {
            gameArea.removeChild(obstacle.element);
            obstacles.splice(index, 1);
        }
    });
    
    clouds.forEach((cloud, index) => {
        cloud.y += gameSpeed * 0.3;
        cloud.element.style.top = `${cloud.y}px`;
        
        if (cloud.y > gameArea.offsetHeight) {
            gameArea.removeChild(cloud.element);
            clouds.splice(index, 1);
        }
    });
    
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    spawnObstacles();
    spawnClouds();
    
    score++;
    updateScore();
    
    if (score >= 10000) {
        showVictory();
        return;
    }
    
    if (score % 500 === 0) {
        gameSpeed += 0.2;
        if (obstacleInterval > 800) {
            obstacleInterval -= 50;
        }
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

function spawnObstacles() {
    const now = Date.now();
    if (now - lastObstacleTime > obstacleInterval) {
        lastObstacleTime = now;
        
        const lane = Math.floor(Math.random() * 3) + 1;
        
        const rand = Math.random();
        let type;
        for (const obstacleType of obstacleTypes) {
            if (rand < obstacleType.spawnChance) {
                type = obstacleType;
                break;
            }
        }
        type = type || obstacleTypes[0]; 
  
        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${type.class}`;
        
        const laneWidth = gameArea.offsetWidth / 3;
        const left = (lane - 1) * laneWidth + laneWidth / 2 - 20;
        
        obstacle.style.left = `${left}px`;
        obstacle.style.top = '-40px';
        gameArea.appendChild(obstacle);
        
        obstacles.push({
            element: obstacle,
            y: -40,
            lane: lane,
            speed: type.speedMultiplier
        });
    }
}

function spawnClouds() {
    if (Math.random() < 0.01) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        const size = Math.random() * 40 + 30;
        const opacity = Math.random() * 0.5 + 0.3;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size}px`;
        cloud.style.opacity = opacity;
        
        const lane = Math.floor(Math.random() * 3) + 1;
        const laneWidth = gameArea.offsetWidth / 3;
        const left = (lane - 1) * laneWidth + Math.random() * (laneWidth - size);
        
        cloud.style.left = `${left}px`;
        cloud.style.top = `-${size}px`;
        gameArea.appendChild(cloud);
        
        clouds.push({
            element: cloud,
            y: -size
        });
    }
}

function checkCollisions() {
    const planeRect = plane.getBoundingClientRect();
    
    for (let obstacle of obstacles) {
        const obstacleRect = obstacle.element.getBoundingClientRect();
        
        if (
            planeRect.left < obstacleRect.right &&
            planeRect.right > obstacleRect.left &&
            planeRect.top < obstacleRect.bottom &&
            planeRect.bottom > obstacleRect.top
        ) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    scoreDisplay.textContent = `Distance: ${score}`;
}

function gameOver() {
    gameRunning = false;
    finalScoreDisplay.textContent = `Distance: ${score}`;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationId);
}

function showVictory() {
    gameRunning = false;
    victoryScreen.classList.remove('hidden');
    cancelAnimationFrame(animationId);
}

function resetGame() {
    initGame();
}


startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', resetGame);
victoryBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' && planePosition > 1) {
        planePosition--;
        updatePlanePosition();
    } else if (e.key === 'ArrowRight' && planePosition < 3) {
        planePosition++;
        updatePlanePosition();
    }
});


let touchStartX = 0;

gameArea.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > 30) {
        if (diff > 0 && planePosition < 3) {
            planePosition++;
        } else if (diff < 0 && planePosition > 1) {
            planePosition--;
        }
        updatePlanePosition();
    }
});
