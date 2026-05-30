// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game Objects
const paddleHeight = 80;
const paddleWidth = 10;
const ballRadius = 7;

const player = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballRadius,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let gameLoopId;

const keys = {};
let mouseY = canvas.height / 2;

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ') {
        e.preventDefault();
        toggleGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Toggle game pause/play
function toggleGame() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        gameLoop();
    }
}

// Update player paddle with mouse and keyboard
function updatePlayer() {
    // Keyboard controls
    if (keys['ArrowUp'] || keys['w']) {
        player.dy = -player.speed;
    } else if (keys['ArrowDown'] || keys['s']) {
        player.dy = player.speed;
    } else {
        player.dy = 0;
    }

    // Mouse control
    const mouseSpeed = 7;
    const distance = mouseY - (player.y + paddleHeight / 2);
    if (Math.abs(distance) > 5) {
        player.dy = (distance > 0 ? 1 : -1) * mouseSpeed;
    }

    player.y += player.dy;

    // Boundary collision for player
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenterY = computer.y + computer.height / 2;
    const distance = ball.y - computerCenterY;

    // AI follows the ball
    if (distance > 10) {
        computer.dy = computer.speed;
    } else if (distance < -10) {
        computer.dy = -computer.speed;
    } else {
        computer.dy = 0;
    }

    computer.y += computer.dy;

    // Boundary collision for computer
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position and physics
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Paddle collision - Player
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball goes right
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < 8) {
            ball.dx = (ball.dx / speed) * (speed + 0.5);
            ball.dy = (ball.dy / speed) * (speed + 0.5);
        }
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball goes left
        ball.x = computer.x - ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < 8) {
            ball.dx = (ball.dx / speed) * (speed + 0.5);
            ball.dy = (ball.dy / speed) * (speed + 0.5);
        }
    }

    // Scoring - Ball off left side
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }

    // Scoring - Ball off right side
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#ff0055';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw game status
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, 50);
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    updateComputer();
    updateBall();
    draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initial draw
draw();
document.getElementById('playerScore').textContent = playerScore;
document.getElementById('computerScore').textContent = computerScore;
