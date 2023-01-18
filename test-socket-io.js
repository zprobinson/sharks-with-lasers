const { io } = require("socket.io-client");
const axios = require("axios");

console.log("test");

const baseSocket = "http://192.168.130.142:3000/";

const logResult = console.log;

const socket = io(baseSocket);

const arenaId = "0000-ATP2";
const playerId = "0fb3d073-6f47-4d60-b404-2daa111d6f1e";

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-5, 6);
const randomTorpedoDirection = randomInterval(0, 2 * Math.PI);

socket.on("connect", () => {
  console.log("we have liftoff");

  socket.emit("takeControl", arenaId, playerId, console.log);
});

socket.on("connect_error", () => {
  console.log("we do not have liftoff");
});

socket.on("disconnect", () => {
  console.log("we have disconnected");
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

  const targetDirections = {
    1: (currentHeading) =>
      currentHeading > Math.PI / 2 && currentHeading < Math.PI,
    2: (currentHeading) =>
      currentHeading > Math.PI && currentHeading < (Math.PI * 3) / 2,
    3: (currentHeading) => currentHeading > 0 && currentHeading < Math.PI / 2,
    4: (currentHeading) =>
      currentHeading > (Math.PI * 3) / 2 && currentHeading < Math.PI * 2,
  };

  const getQuadrant = (centerpoint) => {
    const topLeft = 1;
    const topRight = 2;
    const bottomLeft = 3;
    const bottomRight = 4;

    const x = centerpoint.x;
    const y = centerpoint.y;

    const xMid = window.width / 2;
    const yMid = window.height / 2;

    if (x < xMid && y < yMid) return topLeft;
    else if (x > xMid && y < yMid) return topRight;
    else if (x < xMid && y > yMid) return bottomLeft;
    return bottomRight;
  };

  const centerpoint = beatUpdate.centerpoint;
  const heading = beatUpdate.facing;
  const quadrant = getQuadrant(centerpoint);
  const isHappyHeading = targetDirections[quadrant];
  const weAreHappyWhereWeAreHeading = isHappyHeading(heading);

  let port = randomFinSpeed();
  let starboard = randomFinSpeed();
  //   if (weAreHappyWhereWeAreHeading) {
  //     port =
  //   }

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

socket.on("beatUpdate", (stuff) => {
  tryMove(socket)(stuff);

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
