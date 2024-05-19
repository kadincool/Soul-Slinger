var camera = {x: 0, y: 0, zoom: 1}

function gridSnappedBox(x, y, wid, hei) {
  let snapX = Math.round(x);
  let snapY = Math.round(y);
  let snapW = Math.round(x + wid) - snapX;
  let snapH = Math.round(y + hei) - snapY;
  can2d.fillRect(snapX, snapY, snapW, snapH);
}

function cameraBox(x, y, wid, hei) {
  gridSnappedBox(camX(x), camY(y), wid * camera.zoom, hei * camera.zoom)
}

function camX(x) {
  return (x - camera.x) * camera.zoom + canvas.width / 2;
}

function camY(y) {
  return (y - camera.y) * camera.zoom + canvas.height / 2;
}

function drawEnemies() {
  for (let i in enemies) {
    can2d.fillStyle = wallGradient;
    if (enemies[i].active) {
      can2d.fillStyle = playerGradient;
    }
    // can2d.fillRect(enemies[i].x, enemies[i].y, enemies[i].wid, enemies[i].hei);
    can2d.beginPath();
    can2d.arc(camX(getX(enemies[i])), camY(getY(enemies[i])), enemies[i].wid / 2 * camera.zoom, 0, 2 * Math.PI);
    can2d.fill();
  }
}

function drawOuterWalls() {
  gridSnappedBox(0, 0, canvas.width, camY(0));
  gridSnappedBox(0, 0, camX(0), canvas.height);
  gridSnappedBox(camX(level.wid), 0, canvas.width, canvas.height);
  gridSnappedBox(0, camY(level.hei), canvas.width, canvas.height);
}

function drawWalls() {
  for (let i in level.walls) {
    let curr = level.walls[i];
    // can2d.fillRect(curr.x, curr.y, curr.wid, curr.hei);
    cameraBox(curr.x, curr.y, curr.wid, curr.hei);
  }
}

function drawProjectiles() {
  for (let i in projectiles) {
    can2d.beginPath();
    can2d.arc(camX(projectiles[i].x + projectiles[i].wid / 2), camY(projectiles[i].y + projectiles[i].wid / 2), projectiles[i].wid / 2 * camera.zoom, 0, 2 * Math.PI);
    can2d.fill();
  }
}