const db = require("../model");
const sequelize = require("sequelize");
const path = require("path");
const fs = require("fs");
const Op = sequelize.Op;
module.exports = {
  /* Success message */
  successMesssage: async (res, msg, data) => {
    res.status(200).json({
      success: 1,
      code: 200,
      message: msg,
      body: data,
    });
    return false;
  },

  /*  Filure message */
  errorMesssage: async (res, msg, data) => {
    res.status(400).json({
      success: 0,
      code: 400,
      message: msg,
      body: data,
    });
    return false;
  },

  /* required field function*/
  required_data: function (data) {
    var _totalerror = [];
    for (i = 0; i < data.length; i++) {
      _totalerror.push(data[i].msg);
    }
    var msg = _totalerror.toString();

    var totalerror = {},
      totalerror = {
        message: msg,
        code: 400,
        body: {},
      };
    return totalerror;
  },


  uploadFile: async function (data, folder) {
    let image = data;
    var dir = process.cwd() + "/public/images/" + folder;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, "0777");
    }

    var ext = path.extname(image.name);

    var new_name = "GC_" + (await this.randomString(20)) + ext;

    image.mv(
      process.cwd() + "/public/images/" + folder + "/" + new_name,
      function (err) {
        if (err) {
          return err;
        } else {
          console.log("Uploaded");
        }
      }
    );
    var final = {
      ext: ext,
      name: folder + "/" + new_name,
    };
    return final;
  },

  randomString: async function (length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },







};
