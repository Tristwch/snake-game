const app = new PIXI.Application();
await app.init({ width: 700, height: 700 });
document.body.appendChild(app.canvas);

class SnakeGame {
  constructor() {
    this.snake = [];
    this.food = [];
    this.direction = "right";
    this.baseSpeed = 200;
    this.speed = this.baseSpeed;
    this.gameMode = "classic";
    this.isPlaying = false;
    this.score = 0;
    this.bestScore = 0;
    this.walls = [];
    this.lastUpdate = 0;
    this.init();
  }

  init() {
    this.createGUI();
    this.createSnake();
    this.createFood();
    this.setupControls();
    this.gameLoop();
  }

  createGUI() {
    this.bestScoreLabel = document.getElementById("bestScore");
    this.currentScoreLabel = document.getElementById("currentScore");
    this.playButton = document.getElementById("playButton");
    this.exitButton = document.getElementById("exitButton");
    this.menuButton = document.getElementById("menuButton");
    this.gameModeRadios = document.querySelectorAll("input[name='gameMode']");

    this.playButton.addEventListener("click", () => this.startGame());
    this.exitButton.addEventListener("click", () => window.close());
    this.menuButton.addEventListener("click", () => this.showMenu());
  }

  createSnake() {
    this.snake = [{ x: 9, y: 9 }];
    this.snake.forEach((segment) => this.drawSegment(segment));
  }

  createFood() {
    if (this.gameMode === "portal") {
      this.food = [this.getRandomPosition(), this.getRandomPosition()];
    } else {
      this.food = [this.getRandomPosition()];
    }
    this.drawFood();
  }

  drawSegment(segment) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00ff00);
    graphics.drawRect(segment.x * 35, segment.y * 35, 35, 35);
    graphics.endFill();
    app.stage.addChild(graphics);
  }

  drawFood() {
    this.food.forEach((foodPosition) => {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000);
      graphics.drawRect(foodPosition.x * 35, foodPosition.y * 35, 35, 35);
      graphics.endFill();
      app.stage.addChild(graphics);
    });
  }

  drawWall(wall) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xffff00);
    graphics.drawRect(wall.x * 35, wall.y * 35, 35, 35);
    graphics.endFill();
    app.stage.addChild(graphics);
  }

  setupControls() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && this.direction !== "down")
        this.direction = "up";
      else if (e.key === "ArrowDown" && this.direction !== "up")
        this.direction = "down";
      else if (e.key === "ArrowLeft" && this.direction !== "right")
        this.direction = "left";
      else if (e.key === "ArrowRight" && this.direction !== "left")
        this.direction = "right";
    });
  }

  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  startGame() {
    this.isPlaying = true;
    document.getElementById("menuButtons").classList.add("hidden");
    document.getElementById("gameButtons").classList.remove("hidden");
    this.gameMode = [...this.gameModeRadios].find(
      (radio) => radio.checked
    ).value;
    this.resetGame();
  }

  showMenu() {
    this.isPlaying = false;
    document.getElementById("menuButtons").classList.remove("hidden");
    document.getElementById("gameButtons").classList.add("hidden");
  }

  resetGame() {
    this.score = 0;
    this.speed = this.baseSpeed;
    this.walls = [];
    this.updateScore();
    app.stage.removeChildren();
    this.createSnake();
    this.createFood();
  }

  updateScore() {
    this.currentScoreLabel.textContent = this.score;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreLabel.textContent = this.bestScore;
    }
  }

  gameLoop(timestamp = 0) {
    if (this.isPlaying) {
      const elapsed = timestamp - this.lastUpdate;
      if (elapsed >= this.speed) {
        this.update();
        this.lastUpdate = timestamp;
      }
    }
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update() {
    const head = { ...this.snake[0] };
    if (this.direction === "up") head.y--;
    else if (this.direction === "down") head.y++;
    else if (this.direction === "left") head.x--;
    else if (this.direction === "right") head.x++;

    if (this.gameMode === "noDie") {
      head.x = (head.x + 20) % 20;
      head.y = (head.y + 20) % 20;
    } else {
      if (
        head.x < 0 ||
        head.x >= 20 ||
        head.y < 0 ||
        head.y >= 20 ||
        this.isColliding(head)
      ) {
        this.isPlaying = false;
        this.showMenu();
        return;
      }
    }

    this.snake.unshift(head);
    const foodEatenIndex = this.food.findIndex(
      (food) => head.x === food.x && head.y === food.y
    );

    if (foodEatenIndex !== -1) {
      this.score++;
      this.updateScore();

      if (this.gameMode === "portal") {
        const otherFoodIndex = (foodEatenIndex + 1) % 2;
        this.snake[0] = { ...this.food[otherFoodIndex] }; // Teleport the snake head to the other food cell
        this.food = [this.getRandomPosition(), this.getRandomPosition()];
        this.drawFood();
      } else {
        this.food[0] = this.getRandomPosition();
        this.drawFood();
      }

      if (this.gameMode === "walls") {
        this.createWall();
      }
      if (this.gameMode === "speed") {
        this.speed *= 0.9; // Increase speed by 10%
      }
    } else {
      this.snake.pop();
    }

    app.stage.removeChildren();
    this.snake.forEach((segment) => this.drawSegment(segment));
    this.walls.forEach((wall) => this.drawWall(wall));
    this.drawFood();
  }

  isColliding(position) {
    return (
      this.snake.some(
        (segment) => segment.x === position.x && segment.y === position.y
      ) ||
      this.walls.some((wall) => wall.x === position.x && wall.y === position.y)
    );
  }

  createWall() {
    const wall = this.getRandomPosition();
    this.walls.push(wall);
  }
}

const game = new SnakeGame();
