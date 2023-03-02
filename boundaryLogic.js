import { arenaId, playerId, window } from "./myConfig.js";

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-1, 6);

export const getAngle = (shark, target) => {
  let a = -1 * Math.atan2(target.y - shark.y, target.x - shark.x); // Calc angle between two points

  a = a + Math.PI / 2; // convert to game coordinates

  if (a > Math.PI * 2) return a - Math.PI * 2;

  if (a < 0) return a + Math.PI * 2;

  return a;
};

export const tryMove = (socket) => (beatUpdate) => {
  const isCloseToEdge = (centerpoint) => {
    const { x, y } = centerpoint;
    console.log(centerpoint);
    const closeOnX = x < 50 || x > 750;
    const closeOnY = y < 50 || y > 550;

    return closeOnX || closeOnY;
  };

  const centerpoint = { x: beatUpdate.positionX, y: beatUpdate.positionY };
  const heading = beatUpdate.facing;

  let port = randomFinSpeed();
  let starboard = randomFinSpeed();

  const isWithin = (targetHeading, actualHeading) => {
    console.log("target", targetHeading);
    console.log("actual", actualHeading);
    const twoPi = Math.PI * 2;
    let lowerBound = targetHeading * 0.6;
    let upperBound = targetHeading * 1.4;

    console.log("bounds", { upperBound, lowerBound });

    if (upperBound > twoPi) {
      upperBound = upperBound - twoPi;
    }

    console.log("is greater than lower bound", actualHeading > lowerBound);
    console.log("is lower than upper bound", actualHeading < upperBound);
    const result = actualHeading > lowerBound && actualHeading < upperBound;
    console.log("should be moving", result);
    return result;
  };

  if (isCloseToEdge(centerpoint)) {
    const myAngle = getAngle(centerpoint, {
      x: window.width / 2,
      y: window.height / 2,
    });
    if (isWithin(myAngle, heading)) {
      port = 6;
      starboard = 6;
    } else {
      port = -2;
      starboard = 2;
    }
  }

  socket.emit("setFinSpeed", arenaId, playerId, port, starboard, (result) => {
    // What we do with the CommandUpdate.
    // commandId: string; status: in-progress | succeeded | failed; message: string | null
    console.log("setFinSpeed", result);
  });
};
