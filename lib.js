function normalize(vecX, vecY) {
  let dist = Math.hypot(vecX, vecY);
  return {x: vecX / dist, y: vecY / dist};
}

function dot(vec1X, vec1Y, vec2X, vec2Y) {
  return (vec1X * vec2X) + (vec1Y * vec2Y);
}

function dist(obj1, obj2) {
  return Math.hypot(getX(obj2) - getX(obj1), getY(obj2) - getY(obj1));
}

function closestPointDist(start, end, point) {
  let targetSlope = (end.y - start.y) / (end.x - start.x);
  let targetInt = start.y - start.x * targetSlope;
  let revSlope = -1 / targetSlope;
  let revInt = point.y - point.x * revSlope;

  let min = start.x;
  let max = end.x;
  if (max < min) {
    [min, max] = [max, min];
  }

  let intX = (targetInt - revInt) / (revSlope - targetSlope);
  intX = Math.min(Math.max(intX, min), max);
  let intY = targetSlope * intX + targetInt;
  return dist({x: intX, y: intY}, point);
}

function intersecting(obj1, obj2) {
  return obj1.x + obj1.wid > obj2.x &&
    obj1.x < obj2.x + obj2.wid &&
    obj1.y + obj1.hei > obj2.y &&
    obj1.y < obj2.y + obj2.hei;
}

function inRange(val, range1, range2) {
  if (range1 > range2) {
    [range1, range2] = [range2, range1];
  }
  return val > range1 && val < range2;
}

function inWall(obj) {
  for (let i in level.walls) {
    if (intersecting(obj, level.walls[i])) return i;
  }
  return -1;
}

function raytest(startX, startY, targetX, targetY, obj) {
  let slope = (targetY - startY) / (targetX - startX);
  let int = startY - slope * startX;
  let iSlope = (targetX - startX) / (targetY - startY);
  let iInt = startX - iSlope * startY;

  let leftSample = slope * obj.x + int;
  let rightSample = slope * (obj.x + obj.wid) + int;
  let topSample = iSlope * obj.y + iInt;
  let bottomSample = iSlope * (obj.y + obj.hei) + iInt;
  
  if (leftSample >= obj.y && leftSample <= obj.y + obj.hei && inRange(obj.x, startX, targetX)) {
    return false;
  }
  if (rightSample >= obj.y && rightSample <= obj.y + obj.hei && inRange(obj.x + obj.wid, startX, targetX)) {
    return false;
  }
  if (topSample >= obj.x && topSample <= obj.x + obj.wid && inRange(obj.y, startY, targetY)) {
    return false;
  }
  if (bottomSample >= obj.x && bottomSample <= obj.x + obj.wid && inRange(obj.y + obj.hei, startY, targetY)) {
    return false;
  }
  return true;
}

function raycast(startX, startY, targetX, targetY) {
  let slope = (targetY - startY) / (targetX - startX);
  let int = startY - slope * startX;
  let iSlope = (targetX - startX) / (targetY - startY);
  let iInt = startX - iSlope * startY;

  for (let i in level.walls) {
    curr = level.walls[i];
    let leftSample = slope * curr.x + int;
    let rightSample = slope * (curr.x + curr.wid) + int;
    let topSample = iSlope * curr.y + iInt;
    let bottomSample = iSlope * (curr.y + curr.hei) + iInt;
    if (leftSample >= curr.y && leftSample <= curr.y + curr.hei && inRange(curr.x, startX, targetX)) {
      return false;
    }
    if (rightSample >= curr.y && rightSample <= curr.y + curr.hei && inRange(curr.x + curr.wid, startX, targetX)) {
      return false;
    }
    if (topSample >= curr.x && topSample <= curr.x + curr.wid && inRange(curr.y, startY, targetY)) {
      return false;
    }
    if (bottomSample >= curr.x && bottomSample <= curr.x + curr.wid && inRange(curr.y + curr.hei, startY, targetY)) {
      return false;
    }
  }
  return true;
}

function getX(obj) {
  if (!obj.wid) return obj.x;
  return obj.x + obj.wid / 2;
}

function getY(obj) {
  if (!obj.hei) return obj.y;
  return obj.y + obj.hei / 2;
}
function setX(obj) {
  if (!obj.wid) return obj.x;
  return obj.x - obj.wid / 2;
}

function setY(obj) {
  if (!obj.hei) return obj.y;
  return obj.y - obj.hei / 2;
}