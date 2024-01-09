const db = require("../model");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const user = db.users;
const teams = db.teams;
const team_players = db.team_players;


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
    const checkExistingTeam = await teams.findOne({
        where: { name: requestArr.name },
    });
    if (!checkExistingTeam) {
        const new_team = await teams.create(requestArr);
        return true;
    }else{
        return false;
    }
}


const createPlayer = async(requestArr) =>{
      const create_player = await team_players.create(requestArr);
      return true;
}

module.exports = {
  createUser,
  userByMobileNumber,
  userById,
  createTeam,
  createPlayer
};
