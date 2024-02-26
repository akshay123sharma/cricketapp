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
const platform_fees = 1;

// contests.belongsTo(match, {
//     foreignKey: "match_id",
// });


module.exports = {
    createContest: async (req, res) => {
        try {
           const requestArr = req.body;
            let pool_price =  requestArr.entry_fee * requestArr.total_participants;
            let _platform_fees = requestArr.total_participants * platform_fees;
            requestArr.prize_pool = parseFloat(pool_price - _platform_fees);
            // requestArr.number_of_winners = Math.floor(requestArr.total_participants / 2);
           const create_contest = await contests.create(requestArr);
           if (create_contest) {
                 commonFunction.successMesssage(res, "Contest created successfully", {});
           }else{
                 commonFunction.errorMesssage(res, "Error while creating contest", {});
           } 
       } catch (error) {
           commonFunction.successMesssage(res, "Error while contest created", {}); 
       }
   },

   contestList: async(req,res) => {
    try {
        const match_id = req.params.match_id;
        const contestArr = await contests.findAll({
            where:{
                match_id:match_id
            }
        });
        if (contestArr) {
            commonFunction.successMesssage(res, "Contest get successfully", contestArr);
        }else{
                commonFunction.errorMesssage(res, "No data", []);
        } 
    } catch (error) {
        commonFunction.successMesssage(res, "Error while contest created", {}); 
    }   
    
   }
  

};