import { io } from "socket.io-client";
// import { arenaId, playerId } from "./myConfig";
import { tryMove, getAngle } from "./boundaryLogic.js";
import { arenaId, playerId, window } from "./myConfig.js";
import axios from "axios";

const baseSocket = "http://192.168.130.142:3001/";

const socket = io(baseSocket);

const randomInterval = (max, min) => () =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomFinSpeed = randomInterval(-1, 6);
const randomTorpedoDirection = randomInterval(0, 2 * Math.PI);

socket.on("connect", () => {
  socket.emit("takeControl", arenaId, playerId, console.log);
});

socket.on("beatUpdate", (beat) => {
  const centerpoint = { x: beat.positionX, y: beat.positionY };
  console.log("beatupdate", beat);
  if (beat.isAlive === "yes") {
    const centerOfScreen = getAngle(centerpoint, { x: 400, y: 300 });
    if (beat.torpedoCount > 0 && beat.energy > 30)
      socket.emit("performNarrowScan", arenaId, playerId, centerOfScreen);

    if (beat.energy > 30 && beat.gameTime % 10 === 0)
      socket.emit("fireLaser", arenaId, playerId);

    beat.events.forEach((element) => {
      if (element.event == "narrowScanExecutedEvent") {
        element.sharks.forEach((shark) => {
          if (beat.torpedoCount > 0) {
            const targetAngle = getAngle({ x: 400, y: 300 }, centerpoint);
            socket.emit("fireTorpedo", arenaId, playerId, targetAngle);
          }
        });
      }

      if (beat.health < 400 && beat.mode !== "repair") {
        socket.emit("setFinSpeed", arenaId, playerId, 0, 0);
        socket.emit("setSharkMode", arenaId, playerId, "repair");
      } else if (beat.health > 500 && beat.mode !== "attack") {
        socket.emit("setSharkMode", arenaId, playerId, "attack");
      } else {
        tryMove(socket)(beat);
      }
    });
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
