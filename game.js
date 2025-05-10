// Game variables
const gameArea = document.getElementById('game-area');
const plane = document.getElementById('plane');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const levelUpScreen = document.getElementById('level-up');
const levelMessage = document.getElementById('level-message');

let score = 0;
let gameSpeed = 5;
let planePosition = 2;
let gameRunning = false;
let animationId;
let obstacles = [];
let clouds = [];
let stars = [];
let lastObstacleTime = 0;
let obstacleInterval = 1500; 
let currentBackground = 'sky';
let touchAreas = [];

function initGame() {
    updatePlanePosition();
    
    clearGameElements();
    
    resetGameState();
    
    createTouchAreas();
    
    gameRunning = true;
    lastObstacleTime = Date.now();
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameLoop();
}

function clearGameElements() {
    obstacles.forEach(obstacle => {
        if (obstacle.element && obstacle.element.parentNode) {
            gameArea.removeChild(obstacle.element);
        }
    });
    obstacles = [];
    
    clouds.forEach(cloud => {
        if (cloud.element && cloud.element.parentNode) {
            gameArea.removeChild(cloud.element);
        }
    });
    clouds = [];
    
    stars.forEach(star => {
        if (star.element && star.element.parentNode) {
            gameArea.removeChild(star.element);
        }
    });
    stars = [];
    
    gameArea.className = '';
    gameArea.classList.add(currentBackground);
}

function resetGameState() {
    score = 0;
    gameSpeed = 5;
    obstacleInterval = 1500;
    currentBackground = 'sky';
    updateScore();
    gameOverScreen.style.display = 'none';
    levelUpScreen.classList.add('hidden');
}

function createTouchAreas() {
    touchAreas.forEach(area => {
        if (area && area.parentNode) {
            gameArea.removeChild(area);
        }
    });
    touchAreas = [];
    
    if ('ontouchstart' in window) {
        const leftArea = document.createElement('div');
        leftArea.style.position = 'absolute';
        leftArea.style.left = '0';
        leftArea.style.top = '0';
        leftArea.style.width = '50%';
        leftArea.style.height = '100%';
        leftArea.style.zIndex = '25';
        leftArea.style.opacity = '0';
        leftArea.addEventListener('touchstart', () => movePlaneLeft());
        gameArea.appendChild(leftArea);
        
        const rightArea = document.createElement('div');
        rightArea.style.position = 'absolute';
        rightArea.style.right = '0';
        rightArea.style.top = '0';
        rightArea.style.width = '50%';
        rightArea.style.height = '100%';
        rightArea.style.zIndex = '25';
        rightArea.style.opacity = '0';
        rightArea.addEventListener('touchstart', () => movePlaneRight());
        gameArea.appendChild(rightArea);
        
        touchAreas = [leftArea, rightArea];
    }
}

function movePlaneLeft() {
    if (planePosition > 1) {
        planePosition--;
        updatePlanePosition();
    }
}

function movePlaneRight() {
    if (planePosition < 3) {
        planePosition++;
        updatePlanePosition();
    }
}

function updatePlanePosition() {
    const laneWidth = gameArea.offsetWidth / 3;
    const newLeft = (planePosition - 1) * laneWidth + laneWidth / 2 - plane.offsetWidth / 2;
    plane.style.left = `${newLeft}px`;
    plane.style.top = `${gameArea.offsetHeight - plane.offsetHeight - 20}px`;
}

function gameLoop() {
    if (!gameRunning) return;
    
    moveObstacles();
    moveClouds();
    moveStars();
    
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    spawnObstacles();
    
    spawnClouds();
    
    updateGameProgress();
    
    animationId = requestAnimationFrame(gameLoop);
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += gameSpeed;
        obstacle.element.style.top = `${obstacle.y}px`;
        
        if (obstacle.y > gameArea.offsetHeight) {
            gameArea.removeChild(obstacle.element);
            obstacles.splice(index, 1);
        }
    });
}

function moveClouds() {
    clouds.forEach((cloud, index) => {
        cloud.y += gameSpeed * 0.5;
        cloud.element.style.top = `${cloud.y}px`;
        
        if (cloud.y > gameArea.offsetHeight) {
            gameArea.removeChild(cloud.element);
            clouds.splice(index, 1);
        }
    });
}

function moveStars() {
    stars.forEach((star, index) => {
        star.y += gameSpeed * 0.8;
        star.element.style.top = `${star.y}px`;
        
        if (star.y > gameArea.offsetHeight) {
            gameArea.removeChild(star.element);
            stars.splice(index, 1);
        }
    });
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

function spawnObstacles() {
    const now = Date.now();
    if (now - lastObstacleTime > obstacleInterval) {
        lastObstacleTime = now;
        
        const lane = Math.floor(Math.random() * 3) + 1;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        const laneWidth = gameArea.offsetWidth / 3;
        const left = (lane - 1) * laneWidth + laneWidth / 2 - 20;
        
        obstacle.style.left = `${left}px`;
        obstacle.style.top = '-40px';
        
        gameArea.appendChild(obstacle);
        
        obstacles.push({
            element: obstacle,
            y: -40,
            lane: lane
        });
    }
}

function spawnClouds() {
    if (currentBackground !== 'sky') return;
    
    if (Math.random() < 0.01) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Random size
        const size = Math.random() * 60 + 20;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size}px`;
        
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

function spawnStars() {
    if (currentBackground !== 'space') return;
    
    if (Math.random() < 0.05) {
        const star = document.createElement('div');
        star.className = 'stars';
        
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        const lane = Math.floor(Math.random() * 3) + 1;
        const laneWidth = gameArea.offsetWidth / 3;
        const left = (lane - 1) * laneWidth + Math.random() * (laneWidth - size);
        
        star.style.left = `${left}px`;
        star.style.top = `-${size}px`;
        
        gameArea.appendChild(star);
        
        stars.push({
            element: star,
            y: -size
        });
    }
}

function updateGameProgress() {
    score++;
    
    if (score % 100 === 0) {
        gameSpeed += 0.1;
        if (obstacleInterval > 6500) {
            obstacleInterval -= 35;
        }
    }
    
    checkLevelUps();
    
    updateScore();
}

function checkLevelUps() {
    if (score === 1000 && currentBackground === 'sky') {
        levelUpToSpace();
    } else if (score === 10000) {
        completeGame();
    }
}

function levelUpToSpace() {
    gameRunning = false;
    currentBackground = 'space';
    gameArea.classList.add('space');
    
    levelMessage.textContent = "Entering Space!";
    levelUpScreen.classList.remove('hidden');
    
    setTimeout(() => {
        levelUpScreen.classList.add('hidden');
        gameRunning = true;
        gameLoop();
    }, 4000);
}

function completeGame() {
    gameRunning = false;
    levelMessage.innerHTML = "Congratulations!<br><br>You've completed the game!<br><br>Send a screenshot to #TheHighPlane on Discord for a special reward!";
    levelUpScreen.classList.remove('hidden');

}

function updateScore() {
    scoreDisplay.textContent = `Distance: ${score}`;
}

function gameOver() {
    gameRunning = false;
    finalScoreDisplay.textContent = `Distance: ${score}`;
    gameOverScreen.style.display = 'flex';
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            movePlaneLeft();
            break;
        case 'ArrowRight':
            movePlaneRight();
            break;
        case ' ':
            movePlaneRight();
            break;
    }
});

// Touch controls for mobile
gameArea.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
});

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();
