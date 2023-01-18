const { io } = require("socket.io-client");
const axios = require("axios");

console.log("test");

const baseSocket = "http://192.168.130.142:3000/";

const logResult = console.log;

const socket = io(baseSocket);

const arenaId = "0000-007J";
const playerId = "c1b678ff-3641-495a-9140-526be8e93059";

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

socket.on("beatUpdate", (stuff) => {
  socket.emit(
    "setFinSpeed",
    arenaId,
    playerId,
    { port: randomFinSpeed(), starboard: randomFinSpeed() },
    (result) => {
      //commandUpdate(result);
      logResult("setFinSpeed", result);
    }
  );

  socket.emit("fireLaser", arenaId, playerId);

  socket.emit("fireTorpedo", arenaId, playerId, randomTorpedoDirection());

  socket.emit("performWideScan", arenaId, playerId);
});

socket.on("commandUpdate", (stuff) => console.log("commandUpdate", stuff));

console.log("end of test");
