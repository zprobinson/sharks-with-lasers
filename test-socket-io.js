import { io } from "socket.io-client";
// import { arenaId, playerId } from "./myConfig";
import { tryMove, getAngle } from "./boundaryLogic.js";
import { arenaId, playerId, window } from "./myConfig.js";
import axios from "axios";

const baseSocket = "http://192.168.130.142:3000/";

const socket = io(baseSocket);

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-1, 6);
const randomTorpedoDirection = randomInterval(0, 2 * Math.PI);

socket.on("connect", () => {
  socket.emit("takeControl", arenaId, playerId, console.log);
});

socket.on("beatUpdate", (beat) => {
  if (beat.isAlive === "yes") {
    const centerOfScreen = getAngle(beat.centerPoint, { x: 400, y: 300 });
    if (beat.torpedoCount > 0)
      socket.emit("performNarrowScan", arenaId, playerId, centerOfScreen);

    beat.events.forEach((element) => {
      if (element.event == "narrowScanExecutedEvent") {
        element.sharks.forEach((shark) => {
          if (beat.torpedoCount > 0) {
            const targetAngle = getAngle(beat.centerPoint, shark.center);
            socket.emit("fireTorpedo", arenaId, playerId, targetAngle);
          }
        });
      }
    });
  }

  // socket.emit("fireLaser", arenaId, playerId);

  // socket.emit("fireTorpedo", arenaId, playerId, randomTorpedoDirection());

  // console.log(beat);
  if (beat.health < 400 && beat.mode !== "repair") {
    socket.emit("setFinSpeed", arenaId, playerId, { port: 0, starboard: 0 });
    socket.emit("setSharkMode", arenaId, playerId, "repair");
  } else if (beat.health > 500 && beat.mode !== "attack") {
    socket.emit("setSharkMode", arenaId, playerId, "attack");
  } else {
    tryMove(socket)(beat);
  }

  //   socket.emit("performWideScan", arenaId, playerId, (something) =>
  //     console.log("wide", something)
  //   );
  //   socket.emit("performNarrowScan", arenaId, playerId, 0, (something) =>
  //     console.log("narrow", something)
  //   );
});

socket.on("commandUpdate", (stuff) => console.log("commandUpdate", stuff));

console.log("end of test");
