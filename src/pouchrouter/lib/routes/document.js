"use strict";

//var jsonParser = require("body-parser").json({ limit: "5mb" });
var jsonParser = require("express").json({ limit: "2.2mb" });
var multiparty = require("multiparty");
var Promise = require("bluebird");
var fs = (fs = require("fs"));
var extend = require("extend");

var utils = require("../utils");
var { acl } = require("../guard");

module.exports = function (app) {
  // Create a document
  app.post("/:db", acl, jsonParser, function (req, res, next) {
    var opts = utils.makeOpts(req, req.query);
    //req.db.post(req.body, req.query, function (err, response) {
    req.db.post(req.body, opts, function (err, response) {
      if (err) return utils.sendError(res, err);
      utils.sendJSON(res, 201, response);
    });
  });

  // Retrieve a document
  app.get("/:db/:id(*)", acl, function (req, res, next) {
    var opts = utils.makeOpts(req, req.query);
    req.db.get(req.params.id, opts, function (err, doc) {
      if (err) return utils.sendError(res, err);
      utils.sendJSON(res, 200, doc);
    });
  });

  // Delete a document
  app.delete("/:db/:id(*)", acl, function (req, res, next) {
    var doc = {
      _id: req.params.id,
      _rev: req.query.rev,
    };
    var opts = utils.makeOpts(req, req.query);
    req.db.remove(doc, opts, function (err, response) {
      if (err) return utils.sendError(res, err);
      utils.sendJSON(res, 200, response);
    });
  });

  // Create or update document that has an ID
  app.put("/:db/:id(*)", acl, jsonParser, function (req, res, next) {
    //var opts = req.query;
    var opts = utils.makeOpts(req, req.query);

    function onResponse(err, response) {
      if (err) return utils.sendError(res, err);
      utils.sendJSON(res, 201, response);
    }

    if (/^multipart\/related/.test(req.headers["content-type"])) {
      // multipart, assuming it's also new_edits=false for now
      var doc;
      var promise = Promise.resolve();
      var form = new multiparty.Form();
      var attachments = {};
      form
        .on("error", function (err) {
          return utils.sendError(res, err);
        })
        .on("field", function (_, field) {
          doc = JSON.parse(field);
        })
        .on("file", function (_, file) {
          var type = file.headers["content-type"];
          var filename = file.originalFilename;
          promise = promise
            .then(function () {
              return Promise.promisify(fs.readFile)(file.path);
            })
            .then(function (body) {
              attachments[filename] = {
                content_type: type,
                data: body,
              };
            });
        })
        .on("close", function () {
          promise
            .then(function () {
              // don't store the "follows" key
              Object.keys(doc._attachments).forEach(function (filename) {
                delete doc._attachments[filename].follows;
              });
              // merge, since it could be a mix of stubs and non-stubs
              doc._attachments = extend(true, doc._attachments, attachments);
              req.db.put(doc, opts, onResponse);
            })
            .catch(function (err) {
              utils.sendError(res, err);
            });
        });
      form.parse(req);
    } else {
      // normal PUT
      req.body._id = req.body._id || req.query.id;
      if (!req.body._id) {
        req.body._id =
          !!req.params.id && req.params.id !== "null" ? req.params.id : null;
      }

      req.body._rev = req.body._rev || req.query.rev;
      req.db.put(req.body, opts, onResponse);
    }
  });
};
