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
const contest_teams = db.contest_teams;
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


const createPlayerByName = async (data) => {
  try {
      /*  Check user mobile number exist or not. */
      const existingUserObj = await user.findOne({
        where: { name: data.name },
      });
      if (!existingUserObj) {
        const newUser = await user.create(data);
        return true;
      }
      /*  Create  number with specific type */
      const existingUserWithTypeObj = await user.findOne({
        where: { name: data.name, type: data.type },
      });
      if (existingUserWithTypeObj) {
        const token_update = await user.update(data, {
          where: {
            name: data.name,
          },
        });
        return true;
    } else {
        const existingUserWithTypeObj = await user.findOne({
          where: { name: data.name, is_scorer: 1 },
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

/* Get user detail by mobile number  */
const userByName = async(data) => {
  const userDataObj = await user.findOne({
      where: {
        name: data.name,
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
        [Op.or]: [
          {
            match_date: {
              [Op.gt]: current_date
            }
          },
          {
            match_date: current_date,
            match_time: {
              [Op.gte]: current_time
            }
          }
        ],
        status: 1
      },
      order: [['id', 'DESC']],
      raw: true
    });    
    if (upcoming_match_list) {
      const updatedUpcomingMatches = [];
      for (const match of upcoming_match_list) {
        const team1 = await teams.findByPk(match.team1_id);
        const team2 = await teams.findByPk(match.team2_id);
        if (team1 && team2) {
          match.team1_name = team1.name;
          match.team2_name = team2.name;
          match.team2_photo = team2.team_photo;
          match.team1_photo = team1.team_photo
          updatedUpcomingMatches.push(match);
        }
      }
      return updatedUpcomingMatches;
    }
  } catch (error) {
    return [];
  }
};


const getAllCurrentMatchList = async () => {
  try {
    const current_date = moment().format('YYYY-MM-DD');
    const upcoming_match_list = await match.findAll({
      where: {
        match_date: {
          [Op.eq]: current_date
        },
        status : 2
      },
      order: [['id', 'DESC']],
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
          match.team2_photo = team2.team_photo;
          match.team1_photo = team1.team_photo
          updatedUpcomingMatches.push(match);
        }
      }
      return updatedUpcomingMatches;
    }
  } catch (error) {
    return [];
  }
};

const getAllCompletedMatchList = async () => {
  try {
    const current_date = moment().format('YYYY-MM-DD');
    const upcoming_match_list = await match.findAll({
      where: {
        match_date: {
          [Op.lte]: current_date
        },
        status : 3
      },
      order: [['id', 'DESC']],
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
          match.team2_photo = team2.team_photo;
          match.team1_photo = team1.team_photo
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

const checkBowlerEntryOut = async(dataArr)=>{
  const check_bowler = await score_board_bowling.findOne({
    where: {
      match_id: dataArr.match_id,
      team_id:dataArr.team2_id,
      player_id:dataArr.bowler_id
    },
  });
 return check_bowler;
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
              'fantasy_points',
              'createdAt',
              'updatedAt',
              [
                sequelize.literal(
                    "(SELECT CASE WHEN name IS NOT NULL THEN name ELSE mobile_number END FROM users WHERE id = `score_board_batting`.`player_id` ORDER BY id DESC LIMIT 1)"
                ),
                "player_name",
              ],
            
              [
                sequelize.literal(
                    "(SELECT CASE WHEN name IS NOT NULL THEN name ELSE mobile_number END FROM users WHERE id = `score_board_batting`.`bowler_id` ORDER BY id DESC LIMIT 1)"
                ),
                "bowler_name",
              ],
              [
                sequelize.literal(
                    "(SELECT CASE WHEN name IS NOT NULL THEN name ELSE mobile_number END FROM users WHERE id = `score_board_batting`.`fielder_id` ORDER BY id DESC LIMIT 1)"
                ),
                "fielder_name",
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
        'mainders_over',
        'createdAt',
        'updatedAt',
        [
          sequelize.literal(
              "(SELECT CASE WHEN name IS NOT NULL THEN name ELSE mobile_number END FROM users WHERE id = `score_board_bowlers`.`player_id` ORDER BY id DESC LIMIT 1)"
          ),
          "bowler_name",
        ],
      
    ],
    where: {
        team_id: dataArr.team2_id,
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

const bowlerDetail = async(requestArr) => {
  const check_bowler = await score_board_bowling.findOne({
    where:{
        match_id: requestArr.match_id,
        team_id: requestArr.team_id,  
        player_id: requestArr.player_id,
    }
  });
    return check_bowler;
};

const updateMaidenOverPoint = async (requestArr, updateBowling, updateBatting) => {
  await score_board_batting.update(updateBatting, {
      where: {
          match_id:requestArr.match_id,
          team_id:requestArr.team_id,
          player_id: requestArr.bowler_id,
      },
  });

  await score_board_bowling.update(updateBowling, {
      where: {
          match_id:requestArr.match_id,
          team_id:requestArr.team_id,
          player_id: requestArr.bowler_id,
      },
  });
  return true;
};


// use only for bolwer fantsay point.
const getBattingDetails = async (requestArr) => {
  return await score_board_batting.findOne({
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team_id,
          player_id: requestArr.bowler_id,
      }
  });
};

const getBowlerDetails = async (requestArr) => {
  return await score_board_bowling.findOne({
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team_id,
          player_id: requestArr.bowler_id,
      }
  });
};

const getBattingDetailsOfBowler = async (requestArr) => {
  return await score_board_batting.findOne({
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team2_id,
          player_id: requestArr.bowler_id,
      }
  });
};


// on out dismissal update.
const dismissalUpdate = async(requestArr) => {
      const batsmandet = await score_board_batting.findOne({
        where:{
          match_id: requestArr.match_id,
          team_id: requestArr.team_id,
          player_id: requestArr.player_id,
        }
      });
      let fantasy_points = batsmandet.fantasy_points;
      if (batsmandet.run === 0) {
          fantasy_points -= 2;
      }
      const updateDetail = {
          dismissal_type: requestArr.dismissal_type,
          bowler_id: requestArr.bowler_id,
          fielder_id: requestArr.fielder_id,
          is_stricker: 0,
          balls: batsmandet.balls + 1,
          fantasy_points: fantasy_points,
      };
       await score_board_batting.update(updateDetail, {
          where: {
              match_id : requestArr.match_id,
              team_id : requestArr.team_id,
              player_id : requestArr.player_id,
          },
      });
      
      return true;
};


const updateBowlerFantasyT10 = async (requestArr,_batting_detail_of_bowler) => {
  requestArr.fantasy_points =_batting_detail_of_bowler.fantasy_points;
  requestArr.total_wickets = requestArr.wicket;
  let extraFantasyPoints = 0;
  if (requestArr.dismissal_type == 1 || requestArr.dismissal_type == 7) {
      extraFantasyPoints += 8;
  }
  if (requestArr.total_wickets == 2) {
    extraFantasyPoints += 8;
  }
  if (requestArr.total_wickets == 3) {
    extraFantasyPoints += 16;
  }
  const fantasyObj = {
      fantasy_points: requestArr.fantasy_points + 25 + extraFantasyPoints,
  };
  await score_board_batting.update(fantasyObj, {
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team2_id,
          player_id: requestArr.bowler_id,
      },
  });
  return true;
};


const updateBowlerFantasyT20 = async (requestArr,_batting_detail_of_bowler) => {
  requestArr.fantasy_points =_batting_detail_of_bowler.fantasy_points;
  requestArr.total_wickets = requestArr.wicket;
  let extraFantasyPoints = 0;
  if (requestArr.dismissal_type == 1 || requestArr.dismissal_type == 7) {
      extraFantasyPoints += 8;
  }

  if (requestArr.total_wickets == 3) {
    extraFantasyPoints += 4;
  }

  if (requestArr.total_wickets == 4) {
    extraFantasyPoints += 8;
  }

  if (requestArr.total_wickets == 4) {
    extraFantasyPoints += 16;
  }
  const fantasyObj = {
      fantasy_points: requestArr.fantasy_points + 25 + extraFantasyPoints,
  };
  await score_board_batting.update(fantasyObj, {
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team2_id,
          player_id: requestArr.bowler_id,
      },
  });
  return true;
};


const getFielderDetail = async (requestArr) => {
  return await score_board_batting.findOne({
      where: {
          match_id: requestArr.match_id,
          team_id: requestArr.team2_id,
          player_id: requestArr.fielder_id,
      }
  });
};





const updateFielderFantasyT10 = async (requestArr,fielder_detail) => {
  requestArr.fantasy_points = fielder_detail.fantasy_points;
  let extraFantasyPoints = 0;
  const fantasyObj = {};
  const fielderDetails = await score_board_batting.findOne({
        attributes: ['fielder_id'],
        where: {
            match_id: requestArr.match_id,
            dismissal_type: 1,
            fielder_id: requestArr.fielder_id
        },
        group: ['fielder_id'],
        having: sequelize.literal('COUNT(*) > 3'),
  });
// three wicket bonus
  if(fielderDetails && fielderDetails.fielder_id == requestArr.fielder_id && fielder_detail.three_wicket == 0){
      extraFantasyPoints += 4;
      fantasyObj.three_wicket = 1;
  }

  // stumped
  if (requestArr.dismissal_type == 5) {
      extraFantasyPoints += 12;
  }else if(requestArr.dismissal_type == 2){ // catch
    extraFantasyPoints += 8;
  }else if(requestArr.dismissal_type == 6 ){ //run out
    extraFantasyPoints += 12;
  }
  
  let total_point = requestArr.fantasy_points + extraFantasyPoints;
  fantasyObj.fantasy_points = total_point;
  await score_board_batting.update(fantasyObj, {
    where: {
        match_id: requestArr.match_id,
        team_id: requestArr.team2_id,
        player_id: requestArr.fielder_id,
    },
  });
return true;
};

const updateFielderFantasyT20 = async (requestArr,fielder_detail) => {
  requestArr.fantasy_points = fielder_detail.fantasy_points;
  let extraFantasyPoints = 0;
  const fantasyObj = {};
  const fielderDetails = await score_board_batting.findOne({
        attributes: ['fielder_id'],
        where: {
            match_id: requestArr.match_id,
            dismissal_type: 1,
            fielder_id: requestArr.fielder_id
        },
        group: ['fielder_id'],
        having: sequelize.literal('COUNT(*) > 3'),
  });
// three wicket bonus
  if(fielderDetails && fielderDetails.fielder_id == requestArr.fielder_id && fielder_detail.three_wicket == 0){
      extraFantasyPoints += 4;
      fantasyObj.three_wicket = 1;
  }

  // stumped
  if (requestArr.dismissal_type == 5) {
      extraFantasyPoints += 12;
  }else if(requestArr.dismissal_type == 2){ // catch
    extraFantasyPoints += 8;
  }else if(requestArr.dismissal_type == 6 ){ //run out
    extraFantasyPoints += 12;
  }
  
  let total_point = requestArr.fantasy_points + extraFantasyPoints;
  fantasyObj.fantasy_points = total_point;
  await score_board_batting.update(fantasyObj, {
    where: {
        match_id: requestArr.match_id,
        team_id: requestArr.team2_id,
        player_id: requestArr.fielder_id,
    },
  });
return true;

};
/* Get user detail by id   */
const userDetailById = async(id) => {
  const userDataObj = await user.findOne({
      where: {
        id: id,
      },
      raw:true,
  });
  return userDataObj;
};

const teamNameById = async(id) => {
  const teamDataObj = await teams.findOne({
      where: {
        id: id,
      },
      raw:true,
  });
  return teamDataObj;
};

const contestPlayerList = async(contest_id) => {
    const playerListArr= await contest_teams.findAll({
      attributes: [
          'id',
          'match_id',
          'contest_id',
          'user_id',
          'createdAt',
          'updatedAt',
          [
            sequelize.literal(
                "(SELECT CASE WHEN name IS NOT NULL THEN name ELSE mobile_number END FROM users WHERE id = `contest_teams`.`user_id` ORDER BY id DESC LIMIT 1)"
            ),
            "user_name",
          ],
        
      ],
      where:{
          contest_id: contest_id
      }
  });
  return playerListArr;
};

const playerFantasyPoints = async(player_id) => {
  const playerPointsObj = await score_board_batting.findOne({
      where: {
        player_id: player_id,
      },
      raw:true,
  });
  return playerPointsObj;
};

const createUserWallet = async(userDataObj)=>{
  let walletObj = await user_wallets.findOne({
    where:{
      user_id:userDataObj.id
    },
    raw:true
  });
  if(!walletObj){
    let walletObj = {
      user_id :userDataObj.id,
      amount :0
    }
     await user_wallets.create(walletObj);
     return true;
  }
}


module.exports = {
  createUser,
  userByMobileNumber,
  createPlayerByName,
  userById,
  createTeam,
  createPlayer,
  getAllUpcomingMatchList,
  getAllCurrentMatchList,
  getAllCompletedMatchList,
  addPlayerInScoreBoardTable,
  checkBowlerEntry,
  checkBowlerEntryOut,
  scoreBoardBatting,
  scoreBoardBowler,
  extrasRun,
  bowlerDetail,
  getBattingDetails,
  getBattingDetailsOfBowler,
  getBowlerDetails,
  updateMaidenOverPoint,
  dismissalUpdate,
  updateBowlerFantasyT10,
  updateBowlerFantasyT20,
  getFielderDetail,
  updateFielderFantasyT10,
  updateFielderFantasyT20,
  userDetailById,
  teamNameById,
  contestPlayerList,
  playerFantasyPoints,
  userByName,
  createUserWallet
};
