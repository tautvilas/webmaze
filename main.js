const $canvas = document.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const tileset = new Image();
tileset.src = './tileset.png';

ctx.scale(2,2);

function getWalls(number) {
  if (number > 15) {
    console.error('number too big');
    return;
  }
  const walls = [0, 0, 0, 0];
  let num = number;
  let i = 0;
  while (num != 0) {
    if (num % 2) {
      walls[i] = 1;
    }
    i++;
    num = Math.floor(num / 2);
  }
  return walls;
}

const MAZE_WIDTH = 25;
const MAZE_HEIGHT = 25;

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

function getMaze(availableWalls, extraEmptyChance = 0) {
  const maze = [];

  for (let i = 0; i < (MAZE_WIDTH * MAZE_HEIGHT); i++) {
    const rand = Math.random() * (availableWalls + extraEmptyChance);
    if (rand >= availableWalls) {
      maze.push(0);
    } else {
      maze.push(Math.floor(Math.random(i) * availableWalls));
    }
  }
  return maze;
}

const WIDTH_SCALE = CANVAS_WIDTH / MAZE_WIDTH;
const HEIGHT_SCALE = CANVAS_HEIGHT / MAZE_HEIGHT;

function drawPlayer(position) {
  const x = Math.floor(position / MAZE_WIDTH);
  const y = position % MAZE_WIDTH;
  ctx.drawImage(tileset, 0, 32 * 1, 32, 32, x * WIDTH_SCALE + 2, y * HEIGHT_SCALE + 2, 16, 16);
  //ctx.fillStyle = 'red';
  //ctx.fillRect(x * WIDTH_SCALE + 3, y * HEIGHT_SCALE + 3, WIDTH_SCALE - 6, HEIGHT_SCALE - 6);
}

function drawMaze(maze, memory) {
  for (let i = 0; i < MAZE_WIDTH; i++) {
    for (let j = 0; j < MAZE_HEIGHT; j++) {
      const walls = getWalls(maze[i * MAZE_WIDTH + j]);
      if (i % MAZE_WIDTH === 0) {
        walls[1] = 1;
      }
      if (j === 0) {
        walls[0] = 1;
      }
      if (j === (MAZE_HEIGHT - 1)) {
        walls[2] = 1;
      }
      if (i === (MAZE_WIDTH - 1)) {
        walls[3] = 1;
      }
      ctx.fillStyle = 'black';
      if (!memory[i * MAZE_WIDTH + j]) {
        ctx.fillRect(i * WIDTH_SCALE, j * HEIGHT_SCALE, WIDTH_SCALE, HEIGHT_SCALE);
      }
      if (walls[0]) { // up
        ctx.fillRect(i * WIDTH_SCALE, j * HEIGHT_SCALE, WIDTH_SCALE, 1);
      }
      //ctx.fillStyle = 'green';
      if (walls[1]) { // left
        ctx.fillRect(i * WIDTH_SCALE, j * HEIGHT_SCALE, 1, HEIGHT_SCALE + 1);
      }
      //ctx.fillStyle = 'blue';
      if (walls[2]) { // bottom
        ctx.fillRect(i * WIDTH_SCALE + WIDTH_SCALE, j * HEIGHT_SCALE + HEIGHT_SCALE, -WIDTH_SCALE, 1);
      }
      //ctx.fillStyle = 'purple';
      if (walls[3]) { // right
        ctx.fillRect(i * WIDTH_SCALE + WIDTH_SCALE, j * HEIGHT_SCALE + HEIGHT_SCALE + 1, 1, -HEIGHT_SCALE - 1);
      }
      // TODO check if x and y params not swapped
    }
  }
}

function searchMaze(position, maze, mem) {
  if (mem[position]) {
    return false;
  }
  const x = Math.floor(position / MAZE_WIDTH);
  const y = position % MAZE_WIDTH;
  //ctx.fillStyle = 'blue';
  //ctx.fillRect(x * WIDTH_SCALE + 2, y * HEIGHT_SCALE + 2, WIDTH_SCALE - 3, HEIGHT_SCALE - 3);
  mem[position] = true;
  const walls = getWalls(maze[position]);
  let result = false;

  if (position === maze.length - 1) {
    return true;
  }
  // go left
  if (x > 0 && !walls[1] && !getWalls(maze[position - MAZE_WIDTH])[3]) {
    result = searchMaze(position - MAZE_WIDTH, maze, mem) || result;
  }
  // go right
  if (x < MAZE_WIDTH - 1 && !walls[3] && !getWalls(maze[position + MAZE_WIDTH])[1]) {
    result = searchMaze(position + MAZE_WIDTH, maze, mem) || result;
  }
  // go up
  if (y > 0 && !walls[0] && !getWalls(maze[position - 1])[2]) {
    result = searchMaze(position - 1, maze, mem) || result;
  }
  // go down
  if (y < MAZE_HEIGHT - 1 && !walls[2] && !getWalls(maze[position + 1])[0]) {
    result = searchMaze(position + 1, maze, mem) || result;
  }
  return result;
}

let m;
let proper = false;
let memory;
let i = 0;
while (!proper && i < 1000000) {
  m = getMaze(15, 5);
  memory = {};
  proper = searchMaze(0, m, memory);
  i++;
}
console.log('ITERATION', i);
drawMaze(m, memory);

let playerPosition = 0;
tileset.onload = () => {
  drawPlayer(playerPosition);
};

document.addEventListener("keydown", function(event) {
  const maze = m;
  //event.preventDefault();
  const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
  //console.log(key);
  const x = Math.floor(playerPosition / MAZE_WIDTH);
  const y = playerPosition % MAZE_WIDTH;
  const walls = getWalls(maze[playerPosition]);
  switch (key) { // change to event.key to key to use the above variable
    case "ArrowLeft":
      if (x > 0 && !walls[1] && !getWalls(maze[playerPosition - MAZE_WIDTH])[3]) {
        playerPosition = playerPosition - MAZE_WIDTH;
      }
      break;
    case "ArrowRight":
      if (x < MAZE_WIDTH - 1 && !walls[3] && !getWalls(maze[playerPosition + MAZE_WIDTH])[1]) {
        playerPosition = playerPosition + MAZE_WIDTH;
      }
      break;
    case "ArrowUp":
      if (y > 0 && !walls[0] && !getWalls(maze[playerPosition - 1])[2]) {
        playerPosition--;
      }
      break;
    case "ArrowDown":
      if (y < MAZE_HEIGHT - 1 && !walls[2] && !getWalls(maze[playerPosition + 1])[0]) {
        playerPosition++;
      }
      break;
  }

  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  drawMaze(m, memory);
  drawPlayer(playerPosition);
});

