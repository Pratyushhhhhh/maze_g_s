// pathUtils.js
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function updateCellClass(cell, isPath, context) {
  const p = context.p;
  if (!p) return;

  const { cellSize } = cell;
  const x = cell.i * cellSize;
  const y = cell.j * cellSize;

  p.push(); // Save drawing state
  p.noStroke();
  p.fill(isPath ? "rgba(246, 8, 36, 0.59)" : "rgba(38, 15, 139, 0.62)");
  p.rect(x, y, cellSize, cellSize);
  p.pop(); // Restore state
}

//Returns valid neighboring cells the algorithm can move to.
//A direction is only considered if the wall in that direction is open (false).
export function getNeighbors(cell, grid, algorithm) {
  const neighbors = [];
  const { index } = algorithm;

  const directions = [
    { dx: 0, dy: -1, wallIndex: 0 }, // Top
    { dx: 1, dy: 0, wallIndex: 1 },  // Right
    { dx: 0, dy: 1, wallIndex: 2 },  // Bottom
    { dx: -1, dy: 0, wallIndex: 3 }  // Left
  ];
  //Calculates neighbor coordinates: ni = i + dx, nj = j + dy.
  //Uses algorithm.index(ni, nj) to get the cell’s 1D index in the grid array.
  //If valid, adds that neighbor to the result.

  for (const { dx, dy, wallIndex } of directions) {
    if (!cell.walls[wallIndex]) {
      const ni = cell.i + dx;
      const nj = cell.j + dy;
      const idx = index(ni, nj);
      if (idx !== -1) {
        neighbors.push(grid[idx]);
      }
    }
  }
  return neighbors;
}

export function reconstructPath(end) {
  const path = [];
  let current = end;
  while (current) {
    path.push(current);
    current = current.parent;
  }
  return path.reverse(); //Builds the path in reverse, then reverses it for correct order.
}

//Timing functions
let solveStartTime = null; //marks the start time.

export function startSolveTimer() {
  solveStartTime = performance.now();
}

// calculates the time passed in seconds.
export function getSolveTime() {
  return ((performance.now() - solveStartTime) / 1000).toFixed(2);
}

export function clearSolverState(grid) {
  const canvas = document.getElementById("defaultCanvas0");
  const ctx = canvas.getContext("2d");

  grid.forEach(cell => {
    // Reset solver-related logical state
    cell.visited = false;
    cell.inPath = false;
    cell.parent = null;
    cell.distance = Infinity;
    cell.f = Infinity;
    cell.g = Infinity;
    cell.h = Infinity;
    cell.isFrontier = false;

    // Erase only the translucent overlay (red or blue tint) by redrawing the maze cell background
    // Fill with white so walls are still visible (if maze uses white background)
    const x = cell.i * cell.cellSize;
    const y = cell.j * cell.cellSize;
    ctx.clearRect(x, y, cell.cellSize, cell.cellSize);
    
    // Redraw the cell walls manually (non-destructively)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;


    if (cell.walls[0]) { // top
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cell.cellSize, y);
      ctx.stroke();
    }
    if (cell.walls[1]) { // right
      ctx.beginPath();
      ctx.moveTo(x + cell.cellSize, y);
      ctx.lineTo(x + cell.cellSize, y + cell.cellSize);
      ctx.stroke();
    }
    if (cell.walls[2]) { // bottom
      ctx.beginPath();
      ctx.moveTo(x + cell.cellSize, y + cell.cellSize);
      ctx.lineTo(x, y + cell.cellSize);
      ctx.stroke();
    }
    if (cell.walls[3]) { // left
      ctx.beginPath();
      ctx.moveTo(x, y + cell.cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
}