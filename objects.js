var player = {
  x: 4, y: 4,
  wid: 2, hei: 2,
  xMom: 0, yMom: 0
};

function fireProjectile(clickX, clickY) {
  clickX = (clickX + camera.x) - canvas.width / 2;
  clickY = (clickY + camera.y) - canvas.height / 2;
  // clickX = -camX(-clickX);
  // clickY = -camY(-clickY);
  // console.log(clickX, clickY)
  let normalClick = normalize(clickX - player.x - 5, clickY - player.y - 5);
  makeProgectile(getX(player), getY(player) + .5, normalClick.x * 30, normalClick.y * 30);
  player.xMom -= normalClick.x * 30;
  player.yMom -= normalClick.y * 30;
}

var projectiles = [];
var enemies = [];

function makeProgectile(x, y, xMom = 0, yMom = 0) {
  projectiles.push({
    x: x - 0.5, y: y - 0.5,
    wid: 1, hei: 1,
    xMom: xMom, yMom: yMom,
  });
}

function makeEnemy(x, y) {
  enemies.push({
    x: x - 1, y: y - 1,
    wid: 2, hei: 2,
    xMom: 0, yMom: 0,
    targetX: x, targetY: y,
    secondX: x, secondY: y,
    active: false, second: false,
  });
}

function moveObj(obj, delta) {
  obj.x += obj.xMom * delta;
  let colWallX = inWall(obj);
  if (colWallX >= 0) {
    if (obj.xMom > 0) {
      obj.x = level.walls[colWallX].x - obj.wid;
    } else if (obj.xMom < 0) {
      obj.x = level.walls[colWallX].x + level.walls[colWallX].wid;
    }
    obj.xMom *= -1;
  }
  obj.y += obj.yMom * delta;
  let colWallY = inWall(obj);
  if (colWallY >= 0) {
    if (obj.yMom > 0) {
      obj.y = level.walls[colWallY].y - obj.hei;
    } else if (obj.yMom < 0) {
      obj.y = level.walls[colWallY].y + level.walls[colWallY].hei;
    }
    obj.yMom *= -1;
  }
  return colWallX || colWallY;
}

var level = {
  wid: 100, hei: 60,
  walls: []
}

function makeWall(x, y, wid, hei) {
  level.walls.push({
    x: x, y: y,
    wid: wid, hei, hei
  });
}

function processLevelDat(mode, vals) {
  switch (mode) {
    case "l":
      if (vals.length < 2) break;
      level.wid = vals[0];
      level.hei = vals[1];
      break;
    case "p":
      if (vals.length < 2) break;
      player.x = vals[0] - 1;
      player.y = vals[1] - 1;
      break;
    case "e":
      if (vals.length < 2) break;
      makeEnemy(vals[0], vals[1]);
      break;
    case "w":
      if (vals.length < 4) break;
      makeWall(vals[0], vals[1], vals[2], vals[3]);
      break;
  }
}

function loadLevel(level) {
  let mode = "l";
  const modes = ["l", "p", "e", "w"];
  let vals = [0];

  player.x = 0;
  player.y = 0;

  player.xMom = 0;
  player.yMom = 0;

  level.wid = 100;
  level.hei = 100;

  projectiles = [];
  enemies = [];
  level.walls = [];

  for (let i = 0; i < level.length; i++) {
    if ([" ", "\n", "\r"].includes(level[i])) {
      //do nothing
    } else if (level[i] == ",") {
      vals.push(0);
    } else if (modes.includes(level[i])) {
      processLevelDat(mode, vals);
      mode = level[i];
      vals = [0];
    } else if (level[i] == ";") {
      processLevelDat(mode, vals);
      vals = [0];
    } else if (!isNaN(Number(level[i])) && !level[i] == " ") {
      vals[vals.length - 1] *= 10
      vals[vals.length - 1] += Number(level[i]);
    }
  }
  processLevelDat(mode, vals);
}

// const level1 = `1000, 600 p 50, 50 w 0, 0, 400, 10; 0, 390, 400, 10; 0, 0, 10, 400; 390, 0, 10, 150; 390, 250, 10, 150; 100, 100, 200, 200 e 350, 350 
// w 400, 0, 600, 10; 400, 0, 10, 150; 400, 250, 10, 350; 990, 0, 10, 600; 400, 590, 600, 10
// w 0, 400, 400, 200`;

// const level1 = "1000, 900 p 50, 50 w 0, 0, 400, 10; 0, 390, 400, 10; 0, 0, 10, 400; 390, 0, 10, 150; 390, 250, 10, 150; 100, 100, 200, 200 e 350, 350" + // feild start
// "w 400, 0, 600, 10; 400, 0, 10, 150; 400, 250, 10, 350; 990, 0, 10, 600; 400, 590, 200, 10; 800, 590, 200, 10" + //feild 2
// "w 690, 290, 20, 20; 550, 150, 300, 10; 550, 150, 10, 100; 550, 350, 10, 100; 550, 440, 100, 10; 750, 440, 100, 10; 840, 150, 10, 300;" + //room 1 in feild 2
// "w 620, 230, 160, 20; 620, 350, 160, 20 e 800, 200; 800, 400" + //centerpeice of room 1
// "w 600, 450, 10, 450; 790, 450, 10, 450; 600, 890, 200, 10" + //downward hallway from room 1
// "w 0, 400, 400, 200; 0, 600, 600, 300; 800, 600, 200, 300"; // outer walls
const level1 = "100, 90 p 5, 5 w 0, 0, 40, 1; 0, 39, 40, 1; 0, 0, 1, 40; 39, 0, 1, 15; 39, 25, 1, 15; 10, 10, 20, 20 e 35, 35" + // feild start
"w 40, 0, 60, 1; 40, 0, 1, 15; 40, 25, 1, 35; 99, 0, 1, 60; 40, 59, 20, 1; 80, 59, 20, 1" + //feild 2
"w 69, 29, 2, 2; 55, 15, 30, 1; 55, 15, 1, 10; 55, 35, 1, 10; 55, 44, 10, 1; 75, 44, 10, 1; 84, 15, 1, 30;" + //room 1 in feild 2
"w 62, 23, 16, 2; 62, 35, 16, 2 e 80, 20; 80, 40" + //centerpeice of room 1
"w 60, 45, 1, 45; 79, 45, 1, 45; 60, 89, 20, 1" + //downward hallway from room 1
"w 0, 40, 40, 20; 0, 60, 60, 30; 80, 60, 20, 30"; // outer walls
const level2 = 'w0, 0, 40, 1; 0, 39, 40, 1; 0, 0, 1, 40; 39, 0, 1, 15; 39, 25, 1, 15; 10, 10, 20, 20; 40, 0, 60, 1; 40, 0, 1, 15; 40, 25, 1, 35; 99, 0, 1, 60; 40, 59, 20, 1; 80, 59, 20, 1; 69, 29, 2, 2; 55, 15, 30, 1; 55, 15, 1, 10; 55, 35, 1, 10; 55, 44, 10, 1; 75, 44, 10, 1; 84, 15, 1, 30; 62, 23, 16, 2; 62, 35, 16, 2; 60, 45, 1, 45; 79, 45, 1, 45; 60, 89, 20, 1; 0, 40, 40, 20; 0, 60, 60, 30; 80, 60, 20, 30; 45, 4, 1, 1; 48, 4, 1, 1; 45, 6, 1, 1; 46, 7, 2, 1; 48, 6, 1, 1';
loadLevel(level1);

// //room 1
// makeWall(0, 0, 400, 10);
// makeWall(0, 390, 400, 10);
// makeWall(0, 0, 10, 400);
// makeWall(390, 0, 10, 150);
// makeWall(390, 250, 10, 150);

// makeWall(100, 100, 200, 200);

// makeEnemy(350, 350);
// // makeEnemy(350, 350);

// //room 2
// makeWall(400, 0, 600, 10);
// makeWall(400, 0, 10, 150);
// makeWall(400, 250, 10, 350);
// makeWall(990, 0, 10, 600);
// makeWall(400, 590, 600, 10);

// // //room 2s point matrix
// // for (let i = 0; i < 5; i++) {
// //   for (let j = 0; j < 5; j++) {
// //     makeWall(490 + i * 100, 90 + j * 100, 20, 20);
// //   }
// // }

// //environment
// makeWall(0, 400, 400, 200);