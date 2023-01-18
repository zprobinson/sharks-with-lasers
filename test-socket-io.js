const { io } = require("socket.io-client");

console.log("test");

const baseSocket = "http://192.168.130.142:3000/";

const socket = io(baseSocket);

socket.on("connect", () => {
  console.log("we have liftoff");
  socket.emit(
    "takeControl",
    "0000-0073",
    "1539c7a2-b065-4d69-93a8-314430055925",
    console.log
  );
});

socket.on("connect_error", () => {
  console.log("we do not have liftoff");
});

socket.on("disconnect", () => {
  console.log("we have disconnected");
});

socket.on("beatUpdate", (stuff) => {
  console.log("beatUpdate", stuff);
});

socket.on("commandUpdate", (stuff) => console.log("commandUpdate", stuff));

console.log("end of test");
