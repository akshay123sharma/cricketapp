const commonFunction = require("../function/common_function");
const helper = require("../function/helper");
const jwt = require("jsonwebtoken");
var db = require("../model");
const secret = "mYs3cr3tK3yf0rJWTs!4fjnR2sT4PdPqL5y";
const sequelize = require("sequelize");
const Op = sequelize.Op;
const user = db.users;
const teams = db.teams;
const team_players = db.team_players;

team_players.belongsTo(user, {
    foreignKey: "user_id",
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
            commonFunction.successMesssage(res, "Team created Successfully", {});
        }else {
            commonFunction.errorMesssage(res, "Team name already exits", {});
        }
    } catch (error) {
        commonFunction.successMesssage(res, "Error while created team", {});    
    }
  },


  /* ------ Create Player ------ */
  createPlayer: async(req,res) => {
    try {
        const requestArr = req.body;
        if (req.files && req.files.team_photo) {
            var img = await commonFunction.uploadFile(req.files.team_photo, "teams");
            requestArr.team_photo = img.name;
        }
        const create_team = await helper.createTeam(requestArr);
        if(create_team) {
            commonFunction.successMesssage(res, "Team created Successfully", {});
        }else {
            commonFunction.errorMesssage(res, "Team name already exits", {});
        }
    } catch (error) {
        commonFunction.successMesssage(res, "Error while Player created", {});    
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
            },
        });
        if(playersArr){
            commonFunction.successMesssage(res, "Data Get Successfully", playersArr); 
        }else{
            commonFunction.errorMesssage(res, "No data found", {}); 
        }
    }else{
        commonFunction.errorMesssage(res, "Enter Mobile Number", {}); 
    }
  },

  teamList: async (req, res) => {
    try {
        const teamsArr = await teams.findAll();
        if (teamsArr && teamsArr.length > 0) {
            commonFunction.successMesssage(res, "Team List Get Successfully", teamsArr);
        } else {
            commonFunction.errorMesssage(res, "No data found", {});
        }
    } catch (error) {
        commonFunction.errorMesssage(res, "Error While get team list", {});
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
                },
            ],
            where: {
                team_id: team_id,
            },
        });
        const teamArr = teamDetailArr.map(({ id, team_id, user_id, createdAt, updatedAt, user }) => ({
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
        commonFunction.successMesssage(res, "No data found", {});
    }
    } catch (error) {
        commonFunction.errorMesssage(res, "Internal server error", {});
    }
}



}
