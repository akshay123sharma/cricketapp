var db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const { response } = require("../server");
const Op = sequelize.Op;
const user = db.users;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const match = db.match;
module.exports = {
  stikerDetail: async  (data) => {
        try {
          let striker_detail = score_board_batting.findOne({
            where: {
              match_id: data.match_id,
              team_id: data.team_id,
              is_stricker:1
            },
            raw:true,
        });
          return striker_detail || [];
        } catch (error) {
          console.error("Error strike player detail:", error);
          return [];
        }
  },      

  playerDetailById : async  (data) => {
    try {
      const _player_detail = await score_board_batting.findOne({
        where: {
          player_id: data.player1_id,
          team_id: data.team_id,
          match_id: data.match_id,
        },
        raw:true,
      });
      return _player_detail || [];
    } catch (error) {
      console.error("Error fetching player detail:", error);
      return [];
    }
  },
    
  bowlerDetailById : async (data)=>{
    try {
      let _bolwer_detail = await score_board_bowling.findOne({
        where:{
          player_id:data.bowler_id,
          team_id:data.team_id,
          match_id:data.match_id
        },
        raw:true,
      });
      return _bolwer_detail || [];
    } catch (error) {
      console.error("Error fetching bowler detail:", error);
      return [];
    }
  },

  updateBatsmanScore: async (batsmanObj, conditionObj, player1_id, player2_id) => {
    try {
      const clickType = batsmanObj.type;
      delete batsmanObj.type;
      conditionObj.player_id = player1_id;
      const updateBatsman = await score_board_batting.update(batsmanObj, { where: conditionObj });
        if (updateBatsman && [1, 3, 5, 7].includes(clickType)) {
        await score_board_batting.update({ is_stricker: 0 }, { where: conditionObj });
        conditionObj.player_id = player2_id;
        await score_board_batting.update({ is_stricker: 1 }, { where: conditionObj });
      }
      return updateBatsman;
    } catch (error) {
      console.error("Error updating batsman score:", error);
      throw error;
    }
  },
  
  
  
  updateBowlerScore: async(bowlerObj, conditionObj,bowler_id) => {
    try {
        conditionObj.player_id = bowler_id;
      const update_bowler = await score_board_bowling.update(bowlerObj, {
        where: conditionObj,
      });
      return update_bowler;
    } catch (error) {
      console.error("Error updating batsman score:", error);
      throw error;
    }
  },


   formatOver:async(balls) => {
    const overs = Math.floor(balls / 6);
    const remaining_balls = balls % 6;
    return overs + remaining_balls / 10;
  }
      
};