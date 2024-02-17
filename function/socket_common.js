var db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const { response } = require("../server");
const Op = sequelize.Op;
const user = db.users;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const match = db.match;
const extras = db.extras;

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
          team_id:data.team2_id,
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
  },


  updateExtras:async(dataArr) =>{
        const create_extras= await extras.create(dataArr);
        return create_extras;
  },

  totalScore : async(data) => {
    try {
        const [total_runs, total_extras] = await Promise.all([
            score_board_batting.sum('run', {
                where: { team_id: data.team_id, match_id: data.match_id }
            }),
            extras.sum('count', {
                where: { team_id: data.team_id, match_id: data.match_id }
            })
        ]);
        const total_run_count = total_runs || 0;
        const total_extra_count = total_extras || 0;
        return total_run_count + total_extra_count;
    } catch (error) {
        throw new Error("Error calculating total score: " + error.message);
    }
},

totalOver:async(data)=>{
    let total_overs = score_board_bowling.sum('balls', {
        where: { team_id: data.team2_id, match_id: data.match_id }
    });
    const total_overs_count = total_overs || 0;
    return total_overs_count;
},


calculateFantasyPoints: async(playerDetail, data, isExtra) => {
  let milestoneFlags = {
    milestone30: false,
    milestone50: false,
    milestone130: false,
    milestone150: false,
    milestone170: false
};
  let fantasy_points = playerDetail.fantasy_points;
  fantasy_points += (isExtra ? 0 : data.run);
  if (data.type === 4) {
      fantasy_points += 1;
  } else if (data.type === 6) {
      fantasy_points += 2;
  }

  // Points for milestones
  if (playerDetail.run >= 30 && !milestoneFlags.milestone30) {
    milestoneFlags.milestone30 = true; // Set the flag to true to mark the milestone achieved
      fantasy_points += 4;
  } else if (playerDetail.run >= 50 && !milestoneFlags.milestone50) {
    milestoneFlags.milestone50 = true; // Set the flag to true to mark the milestone achieved
      fantasy_points += 16;
  }

  // Points for strike rate milestones (added only once)
  const strikeRate = ((playerDetail.run + (isExtra ? 0 : data.run)) / (playerDetail.balls + 1)) * 100;
  if (strikeRate > 130 && strikeRate <= 150 && !milestoneFlags.milestone130) {
    milestoneFlags.milestone130 = true;
      fantasy_points += 2; // Strike rate over 130
  } else if (strikeRate > 150 && strikeRate <= 170 && !milestoneFlags.milestone150) {
    milestoneFlags.milestone150 = true;
      fantasy_points += 4; // Strike rate over 150
  } else if (strikeRate > 170 && !milestoneFlags.milestone170) {
    milestoneFlags.milestone170 = true;
      fantasy_points += 6; // Strike rate over 170
  }

  return fantasy_points;
}

      
};