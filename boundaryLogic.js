import { arenaId, playerId, window } from "./myConfig.js";

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-1, 6);

export const getAngle = (shark, target) => {
  let a = -1 * Math.atan2(target.y - shark.y, target.x - shark.x); // Calc angle between two points

  a = a + Math.PI / 2; // convert to game coordinates

  if (a > Math.PI * 2) return a - Math.PI * 2;

  return a;
};

// export const getAngle = (shark, target) => {
//   console.log("shark", shark);
//   console.log("target", target);
//   const twoPi = Math.PI * 2;
//   let angle = -1 * Math.atan2(target.y - shark.y, target.x - shark.x); // Calc angle between two points
//   angle = angle + Math.PI / 2; // convert to game coordinates
//   if (shark.x > window.width / 2 && angle > Math.PI) {
//     angle = angle + Math.PI;
//   }
//   if (angle > twoPi) {
//     angle = angle - twoPi;
//   }
//   console.log("result", Math.abs(angle));
//   return Math.abs(angle);
// };

export const tryMove = (socket) => (beatUpdate) => {
  const isCloseToEdge = (centerpoint) => {
    const { x, y } = centerpoint;
    console.log(centerpoint);
    const closeOnX = x < 300 || x > 750;
    const closeOnY = y < 80 || y > 520;

    return closeOnX || closeOnY;
  };

  const centerpoint = beatUpdate.centerPoint;
  const heading = beatUpdate.facing;

  let port = randomFinSpeed();
  let starboard = randomFinSpeed();

  const isWithin = (targetHeading, actualHeading) => {
    console.log("target", targetHeading);
    console.log("actual", actualHeading);
    const twoPi = Math.PI * 2;
    let lowerBound = targetHeading * 0.8;
    let upperBound = targetHeading * 1.2;

    if (upperBound > twoPi) {
      upperBound = upperBound - twoPi;
    }

    const result = actualHeading > lowerBound && actualHeading < upperBound;
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

  socket.emit(
    "setFinSpeed",
    arenaId,
    playerId,
    { port, starboard },
    (result) => {
      // What we do with the CommandUpdate.
      // commandId: string; status: in-progress | succeeded | failed; message: string | null
      console.log("setFinSpeed", result);
    }
  );
};
