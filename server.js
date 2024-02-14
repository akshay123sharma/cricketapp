const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const fileUpload = require("express-fileupload");
const sequelize = require("./config/config.json");
const models = require("./model");
// models.sequelize.sync({ force: true });
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
var http = require("http").createServer(app);
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
process.env.NODE_ENV = "development";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000;
// const io = require("socket.io")(http);
 app.use(cors({
  origin: '*'
}));
const io = require('socket.io')(http,{
  cors: {
       origin: "*"
  }
  });
require("./routes/api")(app);
require("./socket")(io);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/images', express.static(path.join(__dirname, 'public/images')));

http.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
module.exports = app;
