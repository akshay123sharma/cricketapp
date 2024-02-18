const db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const Op = sequelize.Op;
const user = db.users;
const teams = db.teams;
const team_players = db.team_players;
const match = db.matches;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const extras = db.extras;
var socketfunction = require("./socket_common");
/* Create user   */

const createUser = async (data) => {
  try {
      /*  Check user mobile number exist or not. */
      const existingUserObj = await user.findOne({
        where: { mobile_number: data.mobile_number },
      });
      if (!existingUserObj) {
        const newUser = await user.create(data);
        return true;
      }
      /*  Create  number with specific type */
      const existingUserWithTypeObj = await user.findOne({
        where: { mobile_number: data.mobile_number, type: data.type },
      });
      if (existingUserWithTypeObj) {
        const token_update = await user.update(data, {
          where: {
            mobile_number: data.mobile_number,
          },
        });
        return true;
    } else {
        const existingUserWithTypeObj = await user.findOne({
          where: { mobile_number: data.mobile_number, is_scorer: 1 },
        });
        if(existingUserWithTypeObj){
          return true;
        }else{
          return false;
        }
    }
  } catch (error) {
      throw error;
  }
};

/* Get user detail by mobile number  */
const userByMobileNumber = async(data) => {
    const userDataObj = await user.findOne({
        where: {
          mobile_number: data.mobile_number,
        },
    });
    return userDataObj;
};

/* Get user detail by id   */
const userById = async(data) => {
    const userDataObj = await user.findOne({
        where: {
          id: data.id,
        },
    });
    return userDataObj;
}

/* ---------------------------------TEAMS FUNCTION --------------------------*/
const createTeam = async(requestArr) =>{
  // test
    const checkExistingTeam = await teams.findOne({
        where: { name: requestArr.name },
    });
    if (!checkExistingTeam) {
        const new_team = await teams.create(requestArr);
        if(new_team){
          const teamObj = await teams.findOne({
            where:{
              id:new_team.id
            }
          })
          return teamObj;
        }
       return false;
    }else{
        return false;
    }
}

const createPlayer = async(requestArr) =>{
      const create_player = await team_players.create(requestArr);
      return true;
}

const getAllUpcomingMatchList = async () => {
  try {
    const current_date = moment().format('YYYY-MM-DD');
    const current_time = moment().format('HH:mm');
    const upcoming_match_list = await match.findAll({
      where: {
        match_date: {
          [Op.gte]: current_date
        },
        match_time: {
          [Op.gte]: current_time
        },
      },
      raw:true,
    });
    if (upcoming_match_list) {
      const updatedUpcomingMatches = [];
      for (const match of upcoming_match_list) {
        const team1 = await teams.findByPk(match.team1_id);
        const team2 = await teams.findByPk(match.team2_id);
        if (team1 && team2) {
          match.team1_name = team1.name;
          match.team2_name = team2.name;
          updatedUpcomingMatches.push(match);
        }
      }
      return updatedUpcomingMatches;
    }
  } catch (error) {
    return [];
  }
};

// when create match then when match create then it add the player in the scoreboard
const addPlayerInScoreBoardTable = async (player_list,match_id) => {
  player_list = JSON.parse(player_list);
  for (const playerData of player_list) {
    let object = {
        match_id : match_id,
        team_id:playerData.team_id,
        player_id:playerData.player_id
    }
    await score_board_batting.create(object);
  }
  return true;
};

const checkBowlerEntry = async(dataArr)=>{
    const checkbowler = await score_board_bowling.findOne({
      where: {
        match_id: dataArr.match_id,
        team_id:dataArr.team_id,
        player_id:dataArr.player_id
      },
    });
   return checkbowler;
};

const scoreBoardBatting = async(dataArr) => {
  const scoreBoardBattingArr = await score_board_batting.findAll({
          attributes: [
              'id',
              'match_id',
              'team_id',
              'player_id',
              'position',
              'run',
              'balls',
              'fours',
              'sixs',
              'is_stricker',
              'is_caption',
              'strike_rate',
              'dismissal_type',
              'bowler_id',
              'fielder_id',
              'createdAt',
              'updatedAt',
              [
                  sequelize.literal(
                    "(select name from users where id =`score_board_batting`.`player_id` order by id desc  LIMIT 1)"
                  ),
                  "player_name",
              ],
              [
                  sequelize.literal(
                    "(select name from users where id =`score_board_batting`.`bowler_id` order by id desc  LIMIT 1)"
                  ),
                  "bowler_name",
              ],
              [
                  sequelize.literal(
                    "(select name from users where id =`score_board_batting`.`fielder_id` order by id desc  LIMIT 1)"
                  ),
                  "filder_name",
                ],
          ],
          where: {
              team_id: dataArr.team_id,
              match_id: dataArr.match_id
          },
          raw: true
      });

      return scoreBoardBattingArr;
};

const scoreBoardBowler = async(dataArr)=>{
  const scoreBoardBowlingArr = await score_board_bowling.findAll({
    attributes: [
        'id',
        'match_id',
        'team_id',
        'player_id',
        'runs',
        'wicket',
        'economy',
        'balls',
        'createdAt',
        'updatedAt',
        [
            sequelize.literal(
              "(select name from users where id =`score_board_bowlers`.`player_id` order by id desc  LIMIT 1)"
            ),
            "bowler_name",
        ],
    ],
    where: {
        team_id: dataArr.team_id,
        match_id: dataArr.match_id
    },
    raw: true
  });
return scoreBoardBowlingArr;
};

const extrasRun = async(dataArr) => {
    const counts = await extras.findAll({
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
          where: {
            type: {
              [Op.in]: [8, 9, 10, 11],
            },
          team_id: dataArr.team_id,
          match_id: dataArr.match_id
      },
          group: ['type']
    });
    return counts;
};

const bowlerDetail = async(requestArr)=>{
  const check_bowler = await score_board_bowling.findOne({
    where:{
        match_id: requestArr.match_id,
        team_id: requestArr.team_id,  
        player_id: requestArr.player_id,
    }
}) 
return check_bowler;
};


const updateMaidenOverPoint = async (requestArr, updateBowling, updateBatting) => {
  await score_board_batting.update(updateBatting, {
      where: {
          match_id:requestArr.match_id,
          team_id:requestArr.team_id,
          player_id: requestArr.bolwer_id,
      },
  });

  await score_board_bowling.update(updateBowling, {
      where: {
        match_id:requestArr.match_id,
          team_id:requestArr.team_id,
          player_id: requestArr.bolwer_id,
      },
  });

  return true;
};



const scoreBoardBattingDetail = async(requestArr)=>{
  const getBatingArr = await score_board_batting.findOne({
    where:{
        match_id: requestArr.match_id,
        team_id: requestArr.team_id,  
        player_id: requestArr.bolwer_id,
    }
  });
    return getBatingArr;
};

const scoreBoardBowlerDetail = async(requestArr)=>{
  const getBowlingArr = await score_board_bowling.findOne({
    where:{
        match_id: requestArr.match_id,
        team_id: requestArr.team_id,  
        player_id: requestArr.bolwer_id,
    }
});
    return getBowlingArr;
};


module.exports = {
  createUser,
  userByMobileNumber,
  userById,
  createTeam,
  createPlayer,
  getAllUpcomingMatchList,
  addPlayerInScoreBoardTable,
  checkBowlerEntry,
  scoreBoardBatting,
  scoreBoardBowler,
  extrasRun,
  bowlerDetail,
  scoreBoardBattingDetail,
  scoreBoardBowlerDetail
};
