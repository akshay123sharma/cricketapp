var socketfunction = require("./function/socket_function");
module.exports = function (io) {
    io.on('connection', function(socket) {
        if(socket.id){
                //================ Get the Player and bowler name when start scoring. =============//
            socket.on("create_connection", async function (data) {            
                let getPlayerDetail = await socketfunction.playerDetail(data);
                socket.emit("connect_listener", {getPlayerDetail});
            });

        //=============================UPDATE SCORE ==================================//
            socket.on("score_update", async function (data) {            
                    let update_score = await socketfunction.updateScore(data);
                    socket.emit("score_update_listener", {update_score});
            });




        }
    });
};