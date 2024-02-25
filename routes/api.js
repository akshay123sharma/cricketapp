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
    app.route("/apis/create_match").post(verifyTokenMiddleware,teamModule.createMatch);
    app.route("/apis/match_list").get(verifyTokenMiddleware,teamModule.matchList);
    app.route("/apis/verify_scorer").post(verifyTokenMiddleware,teamModule.verifyScorer);
    app.route("/apis/toss_result").post(verifyTokenMiddleware,teamModule.tossResult);
    app.route("/apis/select_players").post(verifyTokenMiddleware,teamModule.selectPlayers);
    app.route("/apis/next_bowler").post(verifyTokenMiddleware,teamModule.nextBowler);
    app.route("/apis/change_stricker").post(verifyTokenMiddleware,teamModule.changeStricker);
    app.route("/apis/out_player").post(verifyTokenMiddleware,teamModule.outPlayer);
    app.route("/apis/score_board").get(verifyTokenMiddleware,teamModule.scoreBoard);
    app.route("/apis/maiden_over").post(verifyTokenMiddleware,teamModule.maidenOver);
    app.route("/apis/out_player_list").get(verifyTokenMiddleware,teamModule.outPlayerList);
    app.route("/apis/inning_update").post(teamModule.inningUpdate);

};
