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
const match = db.matches;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const contests = db.contests;
const contest_teams = db.contest_teams;


contest_teams.belongsTo(user, {
    foreignKey: "user_id",
});


module.exports = {
    createContest: async (req, res) => {
        try {
            let requestArr = req.body;
            const entryFeesArr = ['19', '49', '89', '179', '299', '525','27','77','230','380','5','100','150','170','300'];
            const memberArr    = ['4', '4', '4', '4', '4', '4','3','3','3','3','1000','20','36','370','40'];
            const prizePoolArr = ['70', '170', '300', '620', '1020', '1800','70','200','600','1020','4500','1680','4900','55000','9999'];
            for (let i = 0; i < entryFeesArr.length; i++) {
                const contest = {
                    entry_fee: entryFeesArr[i],
                    total_participants: memberArr[i],
                    prize_pool: prizePoolArr[i],
                    number_of_winners: 1,
                    match_id:requestArr.match_id
                };
                await contests.create(contest);
            }
            commonFunction.successMesssage(res, "Contests created successfully", {});
        } catch (error) {
            commonFunction.errorMesssage(res, "Error while creating contests", {});
        }
    },
    

   contestList: async(req,res) => {
    try {
        const match_id = req.params.match_id;
        const contestArr = await contests.findAll({
            where:{
                match_id:match_id
            },
            raw:true,
        });
        if (contestArr) {
            for (const contest of contestArr) {
                const count = await contest_teams.count({
                    where: {
                        contest_id: contest.id,
                        match_id: contest.match_id
                    },
                    raw:true,
                });
                contest.count = count;
            }
            commonFunction.successMesssage(res, "Contest get successfully", contestArr);
        }else{
                commonFunction.errorMesssage(res, "No data", []);
        } 
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while contest created", []); 
    }   
   },

   replicateContest:async(req,res)=>{
    try {
        const requestArr = req.body;
        const getContest = await contests.findOne({
            where:{
                id:requestArr.contest_id
            },
            raw:true
        });
        if(getContest){
            let contestObj = {
                match_id:getContest.match_id,
                entry_fee:getContest.entry_fee,
                total_participants:getContest.total_participants,
                number_of_winners:getContest.number_of_winners,
                prize_pool:getContest.prize_pool
            };
            const replicate_contest = await contests.create(contestObj);
            if (replicate_contest) {
                commonFunction.successMesssage(res, "Contest created successfully", {});
            }else{
                commonFunction.errorMesssage(res, "Error while replicate contest", {});
            }
        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while contest created", []); 
    }
   },


   createContestTeam:async(req,res)=>{
    try {
        const requestArr = req.body;
        const create_team = await contest_teams.create(requestArr);
        if(create_team){
            commonFunction.successMesssage(res, "Team created successfully", {});
        }else{
            commonFunction.errorMesssage(res, "Error while creating team", {});
        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while contest created", {}); 
    }
 },


 contestDetail: async(req,res)=>{
     try {
        const contest_id = req.query.contest_id;
        const contestDetail = await contests.findOne({
            where:{
                id:contest_id
            },
            raw:true,
        });
        if(contestDetail){
            contestDetail.player = await helper.contestPlayerList(contest_id);
            commonFunction.successMesssage(res, "Contest detail get successfully", contestDetail);
        }else{
            commonFunction.errorMesssage(res, "No data found", []);

        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while getting contest detail", {}); 
    }
},

 contestDetail: async(req,res)=>{
     try {
        const contest_id = req.params.contest_id;
        const contestDetail = await contests.findOne({
            where:{
                id:contest_id
            },
            raw:true,
        });
        if(contestDetail){
            contestDetail.player = await helper.contestPlayerList(contest_id);
            commonFunction.successMesssage(res, "Contest detail get successfully", contestDetail);
        }else{
            commonFunction.errorMesssage(res, "Error while creating team", []);

        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while contest created", {}); 
    }
},


userContest: async (req, res) => {
    try {
        const matchId = req.query.match_id;
        const user_id = req.query.user_id;
        const userContests = await contest_teams.findAll({
            where: {
                match_id: matchId,
                user_id:user_id
            },
            raw:true
        });
        if (userContests.length > 0) {
            for (let i = 0; i < userContests.length; i++) {
                userContests[i].player_list = JSON.parse(userContests[i].selected_team);
                for (let j = 0; j < userContests[i].player_list.length; j++) {
                    const playerId = userContests[i].player_list[j].player_id;
                    const teamId = userContests[i].player_list[j].team_id;
                    const player = await user.findByPk(playerId);
                    const team = await teams.findByPk(teamId);
                    if (player.name !== null && player.name !== undefined) {
                        userContests[i].player_list[j].player_name = player.name;
                    } else {
                        userContests[i].player_list[j].player_name = player.mobile_number;
                    }
                    userContests[i].player_list[j].team_name = team ? team.name : "";
                }
                userContests[i].contest_detail = await contests.findOne({
                    where:{
                        id: userContests[i].contest_id
                    },
                    raw:true,
                }) 
            }
            commonFunction.successMesssage(res, "Contest  get successfully", userContests);
        }else{
            commonFunction.errorMesssage(res, "No data", []);
        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while contest created", {}); 
    }
},

userTeamDetail:async(req,res) => {
    const contest_id = req.query.contest_id;
    const user_id = req.query.user_id;
    const userContests = await contest_teams.findOne({
        where: {
            contest_id: contest_id,
            user_id:user_id
        },
        raw:true
    });
    if(userContests){
        userContests.selected_team = JSON.parse(userContests.selected_team);
        for (let i = 0; i < userContests.selected_team.length; i++) {
            const player_id = userContests.selected_team[i].player_id;
            const team_id  = userContests.selected_team[i].team_id;
            const player = await helper.userDetailById(player_id);
            const team = await helper.teamNameById(team_id);
            const fantasy_points = await helper.playerFantasyPoints(player_id);
            if (player.name !== null && player.name !== undefined) {
                userContests.selected_team[i].player_name = player.name;
            } else {
                userContests.selected_team[i].player_name = player.mobile_number;
            }
            userContests.selected_team[i].team_name = team.name;
            if(userContests.selected_team[i].is_caption){
                userContests.selected_team[i].points = fantasy_points.fantasy_points * 2;
            }else{
                userContests.selected_team[i].points = fantasy_points.fantasy_points;
            }

            if(userContests.selected_team[i].is_vice_caption){
                userContests.selected_team[i].points = fantasy_points.fantasy_points * 1.5;
            }else{
                userContests.selected_team[i].points = fantasy_points.fantasy_points;
            }
        }
        commonFunction.successMesssage(res, "User team get successfully", userContests);
    }else{
        commonFunction.errorMesssage(res, "No data found", {});
    }
},

contestWinnerList:async(req,res)=>{
    const matchId = req.query.match_id;
    const contest_id = req.query.contest_id;
     try {
        const userContests = await contest_teams.findAll({
            where: {
                match_id: matchId,
                contest_id: contest_id
            },
            raw: true,
        });
        if (userContests.length > 0) {
            for (let i = 0; i < userContests.length; i++) {
                userContests[i].player_list = JSON.parse(userContests[i].selected_team);
                let totalFantasyPoints = 0; // Initialize total fantasy points
    
                for (let j = 0; j < userContests[i].player_list.length; j++) {
                    const playerId = userContests[i].player_list[j].player_id;
                    const fantasy_points = await helper.playerFantasyPoints(playerId,matchId);

                    console.log(fantasy_points,"================1");
    
                    // Calculate points for the player
                    let points = fantasy_points.fantasy_points;
                    if (userContests[i].player_list[j].is_caption) {
                        points *= 2; // Double points for caption
                    }
                    if (userContests[i].player_list[j].is_vice_caption) {
                        points *= 1.5; // 1.5 times points for vice caption
                    }
    
                    userContests[i].player_list[j].points = points; // Assign points to the player in the selected team
                    totalFantasyPoints += points; // Add player's points to total fantasy points

                    console.log(totalFantasyPoints,"===================2");
                }
                userContests[i].total_fantasy_point = totalFantasyPoints; // Assign total fantasy points to the user contest object
                userContests[i].batter_name = await user.findByPk(userContests[i].user_id);
                delete userContests[i].player_list;
            }
            userContests.sort((a, b) => b.total_fantasy_point - a.total_fantasy_point);

            commonFunction.successMesssage(res, "Contest get successfully", userContests);
        } else {
            commonFunction.errorMesssage(res, "No data", []);
        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error while getting contest", {});
 }
}
};