const commonFunction = require("../function/common_function");
const helper = require("../function/helper");
const jwt = require("jsonwebtoken");
var db = require("../model");
const secret = "mYs3cr3tK3yf0rJWTs!4fjnR2sT4PdPqL5y";
const sequelize = require("sequelize");
const { request } = require("../server");
const Op = sequelize.Op;
const user = db.users;
const teams = db.teams;
const team_players = db.team_players;
const matches = db.matches;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;

team_players.belongsTo(user, {
    foreignKey: "user_id",
});

score_board_batting.belongsTo(user, {
    foreignKey: "player_id",
});

module.exports = {
  /* -----  Create Teams ----- */
createTeam: async (req, res) => {
    try {
        const requestArr = req.body;
        if (req.files && req.files.team_photo) {
            var img = await commonFunction.uploadFile(req.files.team_photo, "teams");
            requestArr.team_photo = img.name;
        }
        const create_team = await helper.createTeam(requestArr);
        if(create_team) {
            commonFunction.successMesssage(res, "Team created Successfully", create_team);
        }else {
            commonFunction.errorMesssage(res, "Team name already exits", {});
        }
    } catch (error) {
        commonFunction.successMesssage(res, "Error while created team", {});    
    }
},

createPlayer: async (req, res) => {
     try {
        const requestArr = req.body;
        const userObj = {
            mobile_number: requestArr.mobile_number,
            type: 2
        };
        const user_create = await helper.createUser(userObj);
        if (user_create) {
            const user_data = await helper.userByMobileNumber(userObj);
            const playerObj = {
                user_id: user_data.id,
                team_id: requestArr.team_id
            };
            await helper.createPlayer(playerObj);
        }
        commonFunction.successMesssage(res, "Player created Successfully", {});
    } catch (error) {
        commonFunction.successMesssage(res, "Error while Player created", {}); 
    }
},

playerSearch:async(req,res) => {
    const mobile_number = req.query.mobile_number;
    if(mobile_number){
        const playersArr = await user.findAll({
            attributes: ['id', 'name', 'mobile_number'],
            where: {
              mobile_number: {
                [sequelize.Op.like]: `%${mobile_number}%`,
              },
              type:2
            },
        });
        if(playersArr){
            commonFunction.successMesssage(res, "Data Get Successfully", playersArr); 
        }else{
            commonFunction.errorMesssage(res, "No data found", []); 
        }
    }else{
        commonFunction.errorMesssage(res, "Enter Mobile Number", {}); 
    }
},

teamList: async (req, res) => {
    try {
        const { search_parameters } = req.query;
        const whereClause = {};
        if (search_parameters) {
            whereClause.name = { [Op.like]: `%${search_parameters}%` };
        }
        const teamsArr = await teams.findAll({
            where: whereClause,
            order: [['id', 'DESC']],
        });
        if (teamsArr && teamsArr.length > 0) {
            commonFunction.successMesssage(res, "Team List Get Successfully", teamsArr);
        } else {
            commonFunction.errorMesssage(res, "No data found", []);
        }
    } catch (error) {
        console.error('Error:', error);
        commonFunction.errorMesssage(res, "Error While getting team list", {});
    }
},

teamDetail: async (req, res) => {
     try {
        const team_id = req.params.team_id;
        const teamDetailArr = await team_players.findAll({
            include: [
                {
                    model: user,
                    attributes: [
                        "id",
                        "name",
                        "mobile_number",
                    ],
                    required: false,
                    as: 'user',
                }
            ],
            where: {
                team_id: team_id,
            },
        });
        const teamArr = teamDetailArr.map(({ id, team_id, user_id, createdAt, updatedAt, user}) => ({
            id,
            team_id,
            user_id,
            createdAt,
            updatedAt,
            user_name: user ? user.name || null : null,
            mobile_number: user ? user.mobile_number || null : null,
        }));
    if(teamArr && teamArr.length>0){
         commonFunction.successMesssage(res, "Team List Get Successfully", teamArr);
    }else{
        commonFunction.successMesssage(res, "No data found", []);
    }
    } catch (error) {
        commonFunction.errorMesssage(res, "Internal server error", {});
    }
},

createMatch:async(req,res)=>{
    try{
        const requestArr = req.body;
        const player_list = requestArr.player_list;
        const create_match = await matches.create(requestArr);
        if(create_match){
            let match_id = create_match.id;
            await helper.addPlayerInScoreBoardTable(player_list,match_id);
            commonFunction.successMesssage(res, "Match created Successfully", {});  
        }else{
            commonFunction.errorMesssage(res, "Error while match created", {});
        }
    }catch(error){
        commonFunction.errorMesssage(res, "Internal server error", {});
    }
},

matchList:async(req,res)=>{
    try{
        const upcoming_match_list = await helper.getAllUpcomingMatchList();
        if(upcoming_match_list){
            commonFunction.successMesssage(res, "Upcoming match list get successfully",upcoming_match_list);  
        }else{
            commonFunction.errorMesssage(res, "Error while get upcoming match list", []);
        }
    }catch(error){
        commonFunction.errorMesssage(res, "Internal server error", {});
    }
},

verifyScorer:async(req,res)=>{
     try{
        const requestArr = req.body;
        const check_scorer = await matches.findOne({
            where:{
                scorer_id:requestArr.scorer_id,
                id:requestArr.match_id
            }
        });
        if(check_scorer){
            commonFunction.successMesssage(res, "Scorer Match",check_scorer);  
        }else{
            commonFunction.errorMesssage(res, "You do not have permission to score on this match.contact admin", {});
        }
    }catch(error){
            commonFunction.errorMesssage(res, "Internal server error", {});
    }
},

tossResult:async(req,res)=>{
    try{
        const resultArr = req.body;
        const update_toss_result = await matches.update(resultArr, {
            where: {
              id: resultArr.match_id,
            },
        });
        if(update_toss_result){
            commonFunction.successMesssage(res, "Record Updated successfully", {});
        }else{
            commonFunction.errorMesssage(res, "Error while updating the data", {});
        } 
    }catch(error){
            commonFunction.errorMesssage(res, "Internal server error ",{});
    }
},

selectPlayers: async(req,res)=>{
    try{
        const requestArr = req.body;
        if(requestArr.type == 1) {
            const resetStrikerObj = {
                is_stricker: 0
            };
            await score_board_batting.update(resetStrikerObj, {
                where: {
                    match_id: requestArr.match_id,
                    team_id: requestArr.team_id,
                },
            });
            let playerObj = {
                position : requestArr.position,
                is_stricker: requestArr.is_stricker
            }
            const update_position = await score_board_batting.update(playerObj, {
                where: {
                  match_id: requestArr.match_id,
                  team_id: requestArr.team_id,
                  player_id: requestArr.player_id,
                },
            });

            if(update_position){
                commonFunction.successMesssage(res, "Record Updated successfully", {});
            }else{
                commonFunction.errorMesssage(res, "Error while updating the data", {});
            } 
        }else{
            delete requestArr.type;
            const check_bowler = await helper.bowlerDetail(requestArr);
            if(check_bowler){
                commonFunction.successMesssage(res, "Record added successfully", {});
            }else{
                const add_bowler = await score_board_bowling.create(requestArr); 
                if(add_bowler){
                    commonFunction.successMesssage(res, "Record added successfully", {});
                }else{
                    commonFunction.errorMesssage(res, "Error while updating the data", {});
                } 
            } 
        } 
    }catch(error){
            commonFunction.errorMesssage(res, "Internal server error ",{});
    }
},

nextBowler: async(req,res)=>{
     try{
        const requestArr = req.body;
        const checkBowlerEntry = await helper.checkBowlerEntry(requestArr);
        if(checkBowlerEntry){
            commonFunction.successMesssage(res, "Record Updated successfully", checkBowlerEntry);  
        }else{
            let scoreobj = {
                match_id:requestArr.match_id,
                team_id:requestArr.team_id,
                player_id:requestArr.player_id
            };
            const add_bolwer = await score_board_bowling.create(scoreobj);
            const check_bowler = await helper.checkBowlerEntry(requestArr);
            commonFunction.successMesssage(res, "Record Updated successfully", check_bowler);
        }    
    }catch(error){
            commonFunction.errorMesssage(res, "Internal server error ",{});
    }
},

changeStricker: async (req, res) => {
    try{
            const resultArr = req.body;
            const resetStrikerObj = {
                is_stricker: 0
            };
            const resetStrikerResult = await score_board_batting.update(resetStrikerObj, {
                where: {
                    match_id: resultArr.match_id,
                    team_id: resultArr.team_id,
                },
            });
            if (resetStrikerResult) {
                const updateStrikerObj = {
                    is_stricker: 1
                };
                const updateStrikerResult = await score_board_batting.update(updateStrikerObj, {
                    where: {
                        match_id: resultArr.match_id,
                        team_id: resultArr.team_id,
                        player_id: resultArr.player_id,
                    },
                });

                // get the latest data
                let player_data = await score_board_batting.findOne({
                    where: {
                        match_id: resultArr.match_id,
                        team_id: resultArr.team_id,
                        player_id: resultArr.player_id,
                    },
                })
                if (updateStrikerResult) {
                    commonFunction.successMesssage(res, "Updated successfully", player_data);
                } else {
                    commonFunction.errorMesssage(res, "Error while updating the data", {});
                }
            } else {
                commonFunction.errorMesssage(res, "Error while updating the data", {});
            }

        } catch (error) {
            commonFunction.successMesssage(res, "Internal server errro", {});    
        }
},

outPlayer: async(req,res) => {
    // try{
        const requestArr = req.body;
        const _match_detail = await matches.findByPk(requestArr.match_id);
        const update_dismissal = await helper.dismissalUpdate(requestArr);
        if (update_dismissal) {
            let _update_player_fantasy = {};
            //  here manage the other bowler  case that point added too that particular bowler.
            const fielder_detail = await helper.getFielderDetail(requestArr);
            if(_match_detail.total_over <= 10){
                _update_player_fantasy = await helper.updateFielderFantasyT10(requestArr,fielder_detail);
            }else{
                _update_player_fantasy = await helper.updateFielderFantasyT20(requestArr,fielder_detail);
            } 
            const checkBowlerEntry = await helper.checkBowlerEntryOut(requestArr);
            const updateBowler = {
                wicket: checkBowlerEntry.wicket + 1,
                balls: checkBowlerEntry.balls + 1,
            };
            // if user run out and retired hurt  then no wicket added on bowler count
            if(requestArr.dismissal_type != 6 && requestArr.dismissal_type !=8){
                const updateOutDetail = await score_board_bowling.update(updateBowler, {
                    where: {
                        match_id: requestArr.match_id,
                        team_id: requestArr.team2_id,
                        player_id: requestArr.bowler_id,
                    },
                });
                if (updateOutDetail) {
                    const _batting_detail_of_bowler = await helper.getBattingDetailsOfBowler(requestArr);
                    requestArr.wicket = checkBowlerEntry.wicket + 1;
                    let _update_bolwer_fantasy = {};
                    //  here manage the bowled and lbw case that point added too that particular bowler.
                    if(_match_detail.total_over <= 10){
                            _update_bolwer_fantasy = await helper.updateBowlerFantasyT10(requestArr,_batting_detail_of_bowler);
                    }else{
                            _update_bolwer_fantasy = await helper.updateBowlerFantasyT20(requestArr,_batting_detail_of_bowler);
                    } 
                    commonFunction.successMesssage(res, "Updated successfully", {});
                } else {
                    commonFunction.errorMesssage(res, "Error while updating the data", {});
                }
            }else{
                    commonFunction.successMesssage(res, "Updated successfully", {});
            }
        } 
        // } catch (error) {
        //     commonFunction.successMesssage(res, "Internal server error", {});    
        // }
},

scoreBoard: async (req, res) => {
  try{
        const requestArr = req.query;
        const returnArr = {};
        returnArr['scoreBoardBatting'] = await helper.scoreBoardBatting(requestArr);
        returnArr['scoreBoardBowler'] = await helper.scoreBoardBowler(requestArr);
        returnArr['extraruns'] = await helper.extrasRun(requestArr);
        if(returnArr['scoreBoardBatting'].length > 0 && returnArr['scoreBoardBowler'].length > 0 ){
            commonFunction.successMesssage(res, "Score board get successfully", returnArr);
        }else{
            commonFunction.errorMesssage(res, "No data found", []); 
        }
    } catch (error) {
        commonFunction.successMesssage(res, "Internal server errro", []);    
    }
},

maidenOver: async (req, res) => {
    try{
        const requestArr = req.body;
        const _battingDetail = await helper.getBattingDetails(requestArr);
        const _bowlingDetail = await helper.getBowlerDetails(requestArr);
        const _matchDetail = await matches.findByPk(requestArr.match_id);
        const updateBowling = {
            mainders_over: _bowlingDetail.mainders_over + 1,
        };
        let updateBatting;
        if (_matchDetail.total_overs <= 10) {
            updateBatting = {
                fantasy_points: _battingDetail.fantasy_points + 16,
            };
        } else {
            updateBatting = {
                fantasy_points: _battingDetail.fantasy_points + 12,
            };
        }
        const updateBowler = await helper.updateMaidenOverPoint(requestArr,updateBowling,updateBatting);
        if(updateBowler){
            commonFunction.successMesssage(res, "Update Successfully", {});
        }else{
            commonFunction.errorMesssage(res, "No data found", {}); 
        }
    } catch (error) {
        commonFunction.successMesssage(res, "Internal server errro", {});    
    }
  }
}