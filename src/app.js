const express = require("express");
const logger = require("morgan");
const compression = require("compression");
const cors = require("cors");
const session = require("express-session");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const passport = require("passport");
const path = require("path");
const config = require("./config");
/*const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});*/

class App {
  constructor() {
    console.time("app");
    this._express = express();
    this.config = config;
    this._express.locals.config = config;
    this.port = config.port;
    this.services = [];
    this._express.plugins = [];
    this.baseConf();
  }
  async boot() {
    await this.initViews();
    await this.initSession();
    await this.loadServices();
    await this.loadPlugin();
    await this.loadControllers();
    await this.loadPouchRouter();
    await this.loadErrorHandlers();
    await this.startListening();
  }

  express() {
    return this._express;
  }

  baseConf() {
    this._express.use(logger("tiny"));
    this._express.use(express.json());
    this._express.use(compression());
    this._express.use(cors());
    this._express.options("*", cors());
    //this._express.use(limiter); //  apply to all requests
    this._express.use(express.urlencoded({ extended: false }));
  }

  initViews() {
    this._express.use(express.static(path.join(__dirname, "../public")));
    this._express.set("views", __dirname + "/views");
    this._express.set("view engine", "ejs");
  }

  initSession() {
    this._express.use(cookieParser());
    this._express.use(
      session({
        secret: config.secret,
        resave: false,
        name: config.sessionID,
        saveUninitialized: false,
      })
    );
    this._express.use(require("connect-flash")());
    this._express.use(passport.authenticate("session"));
  }

  loadPlugin() {
    fs.readdirSync(__dirname + "/plugins").forEach((file) => {
      if (~file.indexOf(".js")) {
        var pluginName = file.substr(0, file.length - ".js".length);
        var plugin = require(__dirname + "/plugins/" + file);
        this._express.use(plugin.dispatch);
        this._express.plugins[pluginName] = plugin;
        console.log(`plugin: ${pluginName} loaded`);
      }
    });
  }

  loadControllers() {
    let self = this;
    fs.readdirSync(__dirname + "/controllers").forEach(function (file) {
      if (~file.indexOf(".js")) {
        var controller = require(__dirname + "/controllers/" + file);
        controller.boot(self._express);
        console.log(
          `controller: ${file.substr(0, file.length - ".js".length)} loaded`
        );
      }
    });
  }

  loadPouchRouter() {
    this._express.use("/api", require("./pouchrouter")(require("./pouch")));
  }

  loadErrorHandlers() {
    // catch 404 and forward to error handler
    this._express.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    this._express.use(function (err, req, res, next) {
      console.error(err);

      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      err.error = true;
      res.send(err);
      //res.render("error");
    });
  }

  addService(file) {
    this.services.push(file);
  }

  loadServices() {
    let self = this;
    self.services.forEach((file) => {
      require(__dirname + `/services/${file}.js`)(self._express);
      console.log(`Service file: ${file}.js loaded`);
    });
  }

  get(url, ...methods) {
    this._express.get(url, ...methods);
  }

  post(url, ...methods) {
    this._express.post(url, ...methods);
  }

  showEnv() {
    console.info("Show environment");
    console.log(process.env.DETA_PROJECT_KEY);
    console.log(process.env.DETA_SPACE_APP_VERSION);
    console.log(process.env.DETA_SPACE_APP_HOSTNAME);
    console.warn("Show environment end");
  }

  startListening() {
    this._express.listen(this.config.port, () => {
      console.timeEnd("app");
      //this.showEnv();
      console.log(`Listening at port http://${this.config.domain}`);
    });
  }
}

module.exports = new App();
