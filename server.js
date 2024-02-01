const createError = require("http-errors");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const fileUpload = require("express-fileupload");
const sequelize = require("./config/config.json");
const models = require("./model");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
process.env.NODE_ENV = "development";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./routes/api")(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

http.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

io.on("connection", function (socket) {
  console.log("Connection established: 00000000000000002");
});

module.exports = app;
