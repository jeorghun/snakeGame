const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 오디오 요소 가져오기
const backgroundMusic = new Audio("background.mp3");
const foodEffect = new Audio('collect.mp3')
backgroundMusic.loop=true;
backgroundMusic.volume = 0.5;

// 게임 설정
const boxSize = 20; // 한 칸 크기
const canvasSize = canvas.width / boxSize; // 캔버스 칸 수
let snake = [{ x: 10, y: 10 }]; // 뱀의 초기 위치
let direction = { x: 0, y: 0 }; // 초기 방향 (정지)
let food = spawnFood(); // 음식의 초기 위치
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // 최고 점수 불러오기
let speed = 200; // 초기 속도 (ms)
let lastRenderTime = 0;

// 배경음악 시작
window.addEventListener('keydown', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.error('Audio playback failed:', error);
        });
    }
});

// 음식 위치 생성
function spawnFood() {
  return {
    x: Math.floor(Math.random() * canvasSize),
    y: Math.floor(Math.random() * canvasSize),
  };
}

// 게임 루프
function gameLoop(currentTime) {
  window.requestAnimationFrame(gameLoop);

  const timeSinceLastRender = currentTime - lastRenderTime;
  if (timeSinceLastRender < speed) return;

  lastRenderTime = currentTime;
  update();
  draw();
}

// 게임 업데이트
function update() {
  if (direction.x === 0 && direction.y === 0) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
    resetGame();
    return;
  }

  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      resetGame();
      return;
    }
  }

  if (head.x === food.x && head.y === food.y) {
    food = spawnFood();
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    // 효과음 재생
    foodEffect.currentTime = 0; // 효과음 초기화
    foodEffect.play();

    // 속도 증가
    speed = Math.max(75, speed - 20); // 최소 속도를 75ms로 제한
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

// 게임 초기화
function resetGame() {
  alert(`Game Over! Your score: ${score}`);
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  food = spawnFood();
  score = 0;
  speed = 300; // 속도를 초기화
}

// 게임 그리기
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 음식 그리기
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * boxSize, food.y * boxSize, boxSize, boxSize);

  // 뱀 그리기
  ctx.fillStyle = "aquamarine"; // 머리 색깔
  ctx.fillRect(snake[0].x * boxSize, snake[0].y * boxSize, boxSize, boxSize);

  ctx.fillStyle = "lime"; // 몸체 색깔
  for (let i = 1; i < snake.length; i++) {
    ctx.fillRect(snake[i].x * boxSize, snake[i].y * boxSize, boxSize, boxSize);
  }

  // 점수 표시
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, canvas.height - 20);
  ctx.fillText(`High Score: ${highScore}`, 10, canvas.height - 40);
}

// 키 입력 처리
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

// 게임 루프 시작
window.requestAnimationFrame(gameLoop);
