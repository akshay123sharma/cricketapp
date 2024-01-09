const userModule = require("../controller/login");
const teamModule = require("../controller/team");

const jwtMiddleware = require("../function/middleware");


const verifyTokenMiddleware = (req, res, next) => {
    jwtMiddleware.verifyToken(req, res, next);
};

module.exports = function (app) {
    app.route("/apis/login").post(userModule.login);
    app.route("/apis/edit_profile").post(verifyTokenMiddleware,userModule.edit_profile);
    app.route("/apis/log_out").post(verifyTokenMiddleware,userModule.logOut);
    app.route("/apis/create_team").post(verifyTokenMiddleware,teamModule.createTeam);
    app.route("/apis/create_player").post(verifyTokenMiddleware,teamModule.createPlayer);
    app.route("/apis/player_search").get(verifyTokenMiddleware,teamModule.playerSearch);
    app.route("/apis/team_list").get(verifyTokenMiddleware,teamModule.teamList);
    app.route("/apis/team_detail/:team_id").get(verifyTokenMiddleware,teamModule.teamDetail);



};
