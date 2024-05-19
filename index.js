const canvas = document.getElementById("gameCanvas");
const can2d = canvas.getContext("2d");

var backgroundGradient;
var wallGradient;
var playerGradient;

var lastFrame = Date.now();
var lastTap = 0;

function frame() {
  let delta = Date.now() - lastFrame;
  lastFrame += delta;
  delta /= 1000;
  delta = Math.min(delta, 0.2);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  moveObj(player, delta)

  player.xMom *= 16 ** -delta;
  player.yMom *= 16 ** -delta;

  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].x += projectiles[i].xMom * delta;
    projectiles[i].y += projectiles[i].yMom * delta;
    if (inWall(projectiles[i]) >= 0) {
      projectiles.splice(i, 1);
      i--; //set back 1 because removed in place
    }
  }
  
  for (let i = 0; i < enemies.length; i++) {
    //if within 2, deactivate
    if (Math.hypot(enemies[i].targetX - enemies[i].x, enemies[i].targetY - enemies[i].y) < 2) {
      if (enemies[i].second) {
        enemies[i].targetX = enemies[i].secondX;
        enemies[i].targetY = enemies[i].secondY;
        enemies[i].second = false;
      } else {
        enemies[i].active = false;
      }
    }
    let priority = false;

    //safe distance from player
    if (raycast(getX(enemies[i]), getY(enemies[i]), getX(player), getY(player))) {
      let targetPos = normalize(getX(enemies[i]) - getX(player), getY(enemies[i]) - getY(player));
      enemies[i].targetX = getX(player) + targetPos.x * 10;
      enemies[i].targetY = getY(player) + targetPos.y * 10;
      enemies[i].secondX = getX(player);
      enemies[i].secondY = getY(player);
      enemies[i].active = true;
      enemies[i].second = true;
    }

    //see if any projectiles are safe and find closest one
    for (let j in projectiles) {
      if (raycast(getX(enemies[i]), getY(enemies[i]), getX(projectiles[j]), getY(projectiles[j])) && (!priority || dist(enemies[i], projectiles[j]) < dist(enemies[i], {x: enemies[i].targetX, y: enemies[i].targetY})) && (!raycast(getX(enemies[i]), getY(enemies[i]), getX(player), getY(player)) || dist(player, projectiles[j]) >= 10 && closestPointDist(enemies[i], projectiles[j], player) >= 5)) { //dot(playerNormal.x, playerNormal.y, projNormal.x, projNormal.y) <= 0.5)
        enemies[i].targetX = getX(projectiles[j]);
        enemies[i].targetY = getY(projectiles[j]);
        enemies[i].active = true;
        priority = true;
      }
    }

    //apply momentum
    if (enemies[i].active) {
      if (getX(enemies[i]) < enemies[i].targetX) {
        enemies[i].xMom += 2;
      } else if (getX(enemies[i]) > enemies[i].targetX) {
        enemies[i].xMom -= 2;
      }
      if (getY(enemies[i]) < enemies[i].targetY) {
        enemies[i].yMom += 2;
      } else if (getY(enemies[i]) > enemies[i].targetY) {
        enemies[i].yMom -= 2;
      }
    }

    //move and apply friction
    moveObj(enemies[i], delta);
    enemies[i].xMom *= 8 ** -delta;
    enemies[i].yMom *= 8 ** -delta;

    let reload = false;

    for (let j in projectiles) {
      if (intersecting(enemies[i], projectiles[j])) {
        reload = true;
      }
    }

    if (reload) {
      loadLevel(level1);
      break;
    }

    //delete self if touching player
    if (intersecting(enemies[i], player)) {
      enemies.splice(i, 1);
      i -= 1;
    }
  }

  //move camera
  camera.x = getX(player);
  camera.y = getY(player);
  camera.zoom = Math.min(canvas.width / 50, canvas.height / 50)

  //make gradients
  backgroundGradient = can2d.createLinearGradient(0, 0, canvas.width, canvas.height);
  backgroundGradient.addColorStop(0, `hsl(${(Date.now() / 1000) % 360}, 100%, 25%)`);
  backgroundGradient.addColorStop(1, `hsl(${(Date.now() / 1000 + 30) % 360}, 100%, 25%)`);

  wallGradient = can2d.createLinearGradient(0, 0, canvas.width, canvas.height);
  wallGradient.addColorStop(0, `hsl(${(Date.now() / 1000) % 360}, 100%, 50%)`);
  wallGradient.addColorStop(1, `hsl(${(Date.now() / 1000 + 30) % 360}, 100%, 50%)`);

  playerGradient = can2d.createLinearGradient(0, 0, canvas.width, canvas.height);
  playerGradient.addColorStop(0, `hsl(${(Date.now() / 1000 + 180) % 360}, 100%, 50%)`);
  playerGradient.addColorStop(1, `hsl(${(Date.now() / 1000 + 210) % 360}, 100%, 50%)`);

  //clear screen
  can2d.fillStyle = backgroundGradient;
  can2d.fillRect(0, 0, canvas.width, canvas.height);

  can2d.fillStyle = wallGradient;
  drawWalls();
  drawOuterWalls();

  drawEnemies();
  
  can2d.fillStyle = playerGradient;
  can2d.fillRect(camX(player.x), camY(player.y), player.wid * camera.zoom, player.hei * camera.zoom);

  drawProjectiles();
  
  requestAnimationFrame(frame);
}
frame();

canvas.addEventListener("mousedown", (e) => {
  if (Date.now() - lastTap > 500) {
    fireProjectile(e.offsetX, e.offsetY);
  }
});
canvas.addEventListener("touchstart", (e) => {
  fireProjectile(Math.floor(e.touches[0].pageX), Math.floor(e.touches[0].pageY));
  lastTap = Date.now();
});