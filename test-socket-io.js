const { io } = require("socket.io-client");
const axios = require("axios");

const baseSocket = "http://192.168.130.142:3000/";

const logResult = console.log;

const socket = io(baseSocket);

const arenaId = "0003-W7TD";
const playerId = "26fdf677-a242-40b9-b95d-40b219ed3276";

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-1, 6);
const randomTorpedoDirection = randomInterval(0, 2 * Math.PI);

socket.on("connect", () => {
  socket.emit("takeControl", arenaId, playerId, console.log);
});

// Assumption of screen size at 800 width by 600 height
const window = {
  width: 800,
  height: 600,
};
const tryMove = (socket) => (beatUpdate) => {
  const isCloseToEdge = (centerpoint) => {
    const { x, y } = centerpoint;
    const closeOnX = x < 25 || x > 775;
    const closeOnY = y < 25 || y > 575;

    return closeOnX || closeOnY;
  };

  const centerpoint = beatUpdate.centerPoint;
  const heading = beatUpdate.facing;

  const getAngle = (shark, target) => {
    let a = -1 * Math.atan2(target.y - shark.y, target.x - shark.x); // Calc angle between two points
    a = a + Math.PI / 2; // convert to game coordinates
    return a % (Math.PI * 2);
  };

  let port = randomFinSpeed();
  let starboard = randomFinSpeed();

  const isWithin = (target, actual, lower, upper) => {
    const lowerBound = target - lower;
    const upperBound = target + upper;
    return actual > lowerBound && actual < upperBound;
  };

  if (isCloseToEdge(centerpoint)) {
    const myAngle = getAngle(centerpoint, {
      x: window.width / 2,
      y: window.height / 2,
    });
    if (isWithin(myAngle, heading, 0.5, 0.5)) {
      port = 6;
      starboard = 6;
    } else {
      port = -5;
      starboard = 6;
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
      logResult("setFinSpeed", result);
    }
  );
};

socket.on("beatUpdate", (beat) => {
  if (beat.isAlive === "yes") {
    tryMove(socket)(beat);
  }

  socket.emit("fireLaser", arenaId, playerId);

  socket.emit("fireTorpedo", arenaId, playerId, randomTorpedoDirection());

  //   socket.emit("performWideScan", arenaId, playerId, (something) =>
  //     console.log("wide", something)
  //   );
  //   socket.emit("performNarrowScan", arenaId, playerId, 0, (something) =>
  //     console.log("narrow", something)
  //   );
});

socket.on("commandUpdate", (stuff) => console.log("commandUpdate", stuff));

console.log("end of test");
