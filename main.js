// Game elements
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".highScore");
const levelElement = document.querySelector(".level");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const startButton = document.querySelector(".startButton");
const muteButton = document.querySelector(".muteButton");
const gameOverScreen = document.querySelector(".game-over-screen");
const finalScoreElement = document.querySelector(".final-score");
const highScoreElementGameOver = document.querySelector(
  ".game-over-screen .high-score"
);
const restartButton = document.querySelector(".restart-button");

var backgroundmusic = new Audio();
backgroundmusic.src = "pendulum.mp3";

// Game state
let player = {
  speed: 2.5,
  score: 0,
  highScore: localStorage.getItem("highScore") || 0,
  level: 1,
  isMuted: false,
  gameWidth: 400,
  maxSpeed: 3,
  enemySpeedMultiplier: 0.1, // Enemies slightly slower than player
};

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// Audio elements
const backgroundMusic = new Audio();
backgroundMusic.src = "racing.mp3";
backgroundMusic.loop = true;

const crashSound = new Audio();
crashSound.src = "crash.mp3";

const levelUpSound = new Audio();
levelUpSound.src = "levelup.mp3";

// Event listeners
startButton.addEventListener("click", startGame);
muteButton.addEventListener("click", toggleMute);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Initialize game
updateHighScoreDisplay();

function keyDown(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
  }
}

function keyUp(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = false;
  }
}

function isCollide(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();

  return !(
    aRect.top > bRect.bottom ||
    aRect.bottom < bRect.top ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveLines() {
  const lines = document.querySelectorAll(".lines");
  lines.forEach((line) => {
    if (line.y >= gameArea.offsetHeight) {
      line.y -= gameArea.offsetHeight;
    }
    line.y += player.speed;
    line.style.top = line.y + "px";
  });
}

function moveEnemy(car) {
  const enemies = document.querySelectorAll(".enemy");
  const enemyHeight = 100;
  const minVerticalGap = 200;

  enemies.forEach((enemy) => {
    if (isCollide(car, enemy)) {
      handleCollision();
      return;
    }

    if (enemy.y >= gameArea.offsetHeight) {
      enemy.y = -enemyHeight;

      let validPosition = false;
      let attempts = 0;
      const maxAttempts = 10; 

      while (!validPosition && attempts < maxAttempts) {
        attempts++;
        const newLeft = Math.floor(
          Math.random() * (player.gameWidth - enemy.offsetWidth)
        );
        enemy.style.left = newLeft + "px";

        validPosition = true;
        enemies.forEach((otherEnemy) => {
          if (
            otherEnemy !== enemy &&
            Math.abs(otherEnemy.y - enemy.y) < minVerticalGap &&
            Math.abs(parseInt(otherEnemy.style.left) - newLeft) < 80
          ) {
            validPosition = false;
          }
        });
      }

      enemy.style.backgroundColor = getRandomColor();
    }

    // Enemies now move slower relative to player
    const enemySpeed = player.speed * player.enemySpeedMultiplier;
    enemy.y += enemySpeed;
    enemy.style.top = enemy.y + "px";
  });
}

function handleCollision() {
  if (!player.isMuted) {
    crashSound.currentTime = 0;
    crashSound.play();
  }

  const car = document.querySelector(".car");
  car.classList.add("crash");
  setTimeout(() => car.classList.remove("crash"), 500);

  endGame();
}

function endGame() {
  player.start = false;
  startScreen.style.display = "flex";

  // Update high score if needed
  if (player.score > player.highScore) {
    player.highScore = player.score;
    localStorage.setItem("highScore", player.highScore);
    updateHighScoreDisplay();
  }

  player.start = false;

  // Update the game over screen with scores
  finalScoreElement.textContent = `Your score: ${player.score}`;
  highScoreElementGameOver.textContent = `High score: ${player.highScore}`;

  // Show game over screen
  gameOverScreen.style.display = "flex";

  if (!player.isMuted) {
    backgroundMusic.pause();
  }

  // Add restart functionality
  restartButton.addEventListener("click", function () {
    gameOverScreen.style.display = "none";
    startGame();
  });
}

function updateHighScoreDisplay() {
  highScoreElement.textContent = `HIGH SCORE: ${player.highScore}`;
}

function gamePlay() {
  if (player.start) {
    const car = document.querySelector(".car");
    const road = gameArea.getBoundingClientRect();

    moveLines();
    moveEnemy(car);

    // Player movement
    if (keys.ArrowUp && player.y > road.top) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < road.bottom - car.offsetHeight) {
      player.y += player.speed;
    }
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < road.width - car.offsetWidth) {
      player.x += player.speed;
    }

    car.style.top = player.y + "px";
    car.style.left = player.x + "px";

    // Update score and check for level up
    player.score++;
    scoreElement.textContent = `SCORE: ${player.score}`;

    checkLevelUp();

    window.requestAnimationFrame(gamePlay);
  }
}

function checkLevelUp() {
  const newLevel = Math.floor(player.score / 3000) + 1;
  if (newLevel > player.level) {
    player.level = newLevel;
    levelElement.textContent = `LEVEL: ${player.level}`;

    // Smaller speed increase
    player.speed = Math.min(player.speed + 0.15, player.maxSpeed);

    // Show level up animation
    const levelUp = document.createElement("div");
    levelUp.className = "levelUp";
    levelUp.textContent = `LEVEL ${player.level}!`;
    gameArea.appendChild(levelUp);
    setTimeout(() => levelUp.remove(), 2000);

    if (!player.isMuted) {
      levelUpSound.currentTime = 0;
      levelUpSound.play();
    }
  }
}

function startGame() {
  backgroundmusic.play();
  startScreen.style.display = "none";
  gameArea.innerHTML = "";

  // Reset player state
  player.start = true;
  player.score = 0;
  player.level = 1;
  player.speed = 5;

  scoreElement.textContent = `SCORE: ${player.score}`;
  levelElement.textContent = `LEVEL: ${player.level}`;

  // Play background music
  if (!player.isMuted) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
  }

  // Create road lines
  for (let i = 0; i < 10; i++) {
    const line = document.createElement("div");
    line.className = "lines";
    line.y = i * 150;
    line.style.top = line.y + "px";
    gameArea.appendChild(line);
  }

  // Create player car
  const car = document.createElement("div");
  car.className = "car";
  car.style.backgroundColor = "#ff5500"; // Player car color
  gameArea.appendChild(car);

  player.x = car.offsetLeft;
  player.y = car.offsetTop;

  // Create enemy cars with random colors
  for (let i = 0; i < 5; i++) {
    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.y = (i + 1) * 350 * -1;
    enemy.style.top = enemy.y + "px";
    enemy.style.left =
      Math.floor(Math.random() * (player.gameWidth - 60)) + "px";
    enemy.style.backgroundColor = getRandomColor();
    gameArea.appendChild(enemy);
  }

  window.requestAnimationFrame(gamePlay);
}

// Add this helper function
function getRandomColor() {
  const colors = [
    "#FF5252",
    "#FF4081",
    "#E040FB",
    "#7C4DFF",
    "#536DFE",
    "#448AFF",
    "#40C4FF",
    "#18FFFF",
    "#64FFDA",
    "#69F0AE",
    "#B2FF59",
    "#EEFF41",
    "#FFFF00",
    "#FFD740",
    "#FFAB40",
    "#FF6E40",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function toggleMute() {
  player.isMuted = !player.isMuted;
  muteButton.textContent = player.isMuted ? "🔇 SOUND OFF" : "🔊 SOUND ON";

  if (player.isMuted) {
    backgroundMusic.pause();
  } else if (player.start) {
    backgroundMusic.play();
  }
}
