"use strict";

var express = require("express");

var routes = {
  db: require("./lib/routes/db.js"),
  document: require("./lib/routes/document.js"),
  attachments: require("./lib/routes/attachments.js"),
};

module.exports = function (PouchDB) {
  var app = express.Router();

  app.use(function (req, res, next) {
    for (var prop in req.query) {
      try {
        req.query[prop] = JSON.parse(req.query[prop]);
      } catch (e) {}
    }
    next();
  });

  app.get("/", function (req, res) {
    res.status(200).send({
      error: false,
      user: req.couchSession.userCtx.name,
      data: "Welcome to database backend.",
    });
  });

  app.get("/_session", function (req, res) {
    res.status(200).send({
      ok: true,
      userCtx: req.couchSession.userCtx,
    });
  });

  routes.db(app, PouchDB);
  routes.attachments(app, PouchDB);
  routes.document(app, PouchDB);

  app.use(function (req, res) {
    res.status(404).send({
      error: "not_found",
      reason: "missing",
    });
  });

  // error handler
  app.use(function (err, req, res, next) {
    var status = err.status || 500;
    return res.status(status).json({
      error: true,
      message: err.message,
      reason: err.name || err.message,
    });
  });

  return app;
};

// Used for testing porpoises
// var PouchDB = require('pouchdb');
// var app = express();
// app.use(module.exports(PouchDB));
// app.listen(5985);
