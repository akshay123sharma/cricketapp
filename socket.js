console.log("Module loaded: 00000000000000001");

module.exports = function (io) {
  io.on("connection", function (socket) {
    console.log("Connection established: 00000000000000002");
  });
};