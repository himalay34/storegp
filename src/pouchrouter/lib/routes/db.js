"use strict";

// var jsonParser = require("body-parser").json({ limit: "1mb" });
var jsonParser = require("express").json({ limit: "2.2mb" });
var extend = require("extend");

var utils = require("../utils");
var { acl, adminOnly } = require("../guard");
//var Security = require("../../pouch-security");

module.exports = function (app, PouchDB) {
  PouchDB.plugin({
    getSecurityObj: function (callback) {
      var db = this;
      var promise = db
        .get(`_local/${process.env.LOCAL_DOC_KEY}`)
        .catch(function () {
          return { security: {} };
        })
        .then(function (doc) {
          return doc.security;
        });
      utils.nodify(promise, callback);
      return promise;
    },
  });
  PouchDB.plugin(require("pouchdb-validation"));

  // Create a database
  app.put("/:db", acl, jsonParser, function (req, res, next) {
    var name = utils.cleanFilename(req.params.db);
    var db = new PouchDB(name, utils.makeOpts(req));
    db.info()
      .then(function () {
        res.status(201).send({ ok: true });
      })
      .catch(function (err) {
        res.status(412).send(err);
      });
  });

  // Delete a database
  app.delete("/:db", acl, function (req, res, next) {
    var name = utils.cleanFilename(req.params.db);
    new PouchDB(name, utils.makeOpts(req)).destroy(function (err, info) {
      if (err) return res.status(500).send(err);
      res.status(200).send({ ok: true });
    });
  });

  ["/:db/*", "/:db"].forEach(function (route) {
    app.all(route, function (req, res, next) {
      var name = utils.cleanFilename(req.params.db);
      var db = new PouchDB(name, utils.makeOpts(req));
      //db.installSecurityMethods();
      db.installValidationMethods();
      req.db = db;
      req.db.getSecurityObj().then(function (secObj) {
        req.db.__opts.secObj = secObj;
        req.couchSecurityObj = secObj;
        next();
      });
    });
  });

  // Get database information
  app.get("/:db", acl, function (req, res, next) {
    req.db.info(function (err, info) {
      if (err) return res.status(500).send(err);
      res.status(200).send(info);
    });
  });

  // Bulk docs operations
  app.post("/:db/_bulk_docs", acl, jsonParser, function (req, res, next) {
    var opts = "new_edits" in req.body ? { new_edits: req.body.new_edits } : {};

    if (Array.isArray(req.body)) {
      return res.status(400).send({
        error: "bad_request",
        reason: "Request body must be a JSON object",
      });
    }

    req.db.bulkDocs(req.body, opts, function (err, response) {
      if (err) return utils.sendError(res, err);
      res.status(201).send(response);
    });
  });

  // All docs operations
  app.all("/:db/_all_docs", acl, jsonParser, function (req, res, next) {
    if (req.method !== "GET" && req.method !== "POST") return next();

    // Check that the request body, if present, is an object.
    if (
      !!req.body &&
      (typeof req.body !== "object" || Array.isArray(req.body))
    ) {
      return res.status(400).send({
        reason: "Something wrong with the request",
        error: "bad_request",
      });
    }

    //var opts = extend({}, req.body, req.query);
    var opts = utils.makeOpts(req, extend({}, req.body, req.query));
    req.db.allDocs(opts, function (err, response) {
      if (err) return res.status(500).send(err);
      res.status(200).send(response);
    });
  });

  // Monitor database changes
  function changes(req, res, next) {
    req.query.query_params = JSON.parse(JSON.stringify(req.query));

    if (req.body && req.body.doc_ids) {
      req.query.doc_ids = req.body.doc_ids;
    }

    if (req.query.feed === "continuous" || req.query.feed === "longpoll") {
      var heartbeatInterval;
      var timeout;
      var heartbeat =
        typeof req.query.heartbeat === "number" ? req.query.heartbeat : 6000;
      var written = false;
      heartbeatInterval = setInterval(function () {
        res.write("\n");
      }, heartbeat);

      var cleanup = function () {
        if (timeout) {
          clearTimeout(timeout);
        }
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
      };

      if (req.query.feed === "continuous") {
        req.query.live = req.query.continuous = true;
        req.db
          .changes(req.query)
          .on("change", function (change) {
            written = true;
            res.write(JSON.stringify(change) + "\n");
          })
          .on("error", function (err) {
            if (!written) {
              utils.sendError(res, err);
            } else {
              res.end();
            }
            cleanup();
          });
      } else {
        // longpoll
        // first check if there are >0. if so, return them immediately
        req.query.live = req.query.continuous = false;
        if (req.query.timeout) {
          timeout = setTimeout(function () {
            written = true;
            res.write(
              JSON.stringify({
                results: [],
                last_seq: req.query.since,
              }) + "\n"
            );
            res.end();
            cleanup();
          }, req.query.timeout);
        }
        req.db
          .changes(req.query)
          .on("complete", function (complete) {
            if (!complete.results) {
              // canceled, ignore
              cleanup();
            } else if (complete.results.length) {
              written = true;
              res.write(JSON.stringify(complete) + "\n");
              res.end();
              cleanup();
            } else {
              // do the longpolling
              req.query.live = req.query.continuous = true;

              var changes = req.db
                .changes(req.query)
                .on("change", function (change) {
                  if (written) {
                    return;
                  }
                  written = true;
                  res.write(
                    JSON.stringify({
                      results: [change],
                      last_seq: change.seq,
                    }) + "\n"
                  );
                  res.end();
                  changes.cancel();
                  cleanup();
                })
                .on("error", function (err) {
                  if (!written) {
                    utils.sendError(res, err);
                  }
                  cleanup();
                });
            }
          })
          .on("error", function (err) {
            if (!written) {
              utils.sendError(res, err);
            }
            cleanup();
          });
      }
    } else {
      // straight shot, not continuous
      req.db
        .changes(req.query)
        .then(function (response) {
          utils.sendJSON(res, 200, response);
        })
        .catch(function (err) {
          utils.sendError(res, err);
        });
    }
  }

  app.get("/:db/_changes", acl, changes);

  app.post("/:db/_changes", acl, jsonParser, changes);

  // DB Compaction
  app.post("/:db/_compact", acl, jsonParser, function (req, res, next) {
    req.db.compact(req.query, function (err, response) {
      if (err) return utils.sendError(res, err);
      res.status(200).send({ ok: true });
    });
  });

  // Revs Diff
  app.post("/:db/_revs_diff", acl, jsonParser, function (req, res, next) {
    req.db.revsDiff(req.body || {}, req.query, function (err, diffs) {
      if (err) return utils.sendError(res, err);
      res.status(200).send(diffs);
    });
  });

  // Query a document view
  app.get("/:db/_design/:id/_view/:view", acl, function (req, res, next) {
    var query = req.params.id + "/" + req.params.view;
    req.db.query(query, req.query, function (err, response) {
      if (err) return res.status(500).send(err);
      res.status(200).send(response);
    });
  });

  // Temp Views
  app.post("/:db/_temp_view", acl, jsonParser, function (req, res, next) {
    if (req.body.map) req.body.map = new Function("return " + req.body.map)();
    req.query.conflicts = true;
    req.db.query(req.body, req.query, function (err, response) {
      if (err) return utils.sendError(res, err);
      utils.sendJSON(res, 200, response);
    });
  });

  app.get("/:db/_install_security", adminOnly, function (req, res) {
    var doc = {
      _id: `_local/${process.env.LOCAL_DOC_KEY}`,
      security: {
        admins: {
          names: [],
          roles: [],
        },
        members: {
          names: [],
          roles: [],
        },
      },
    };

    req.db.get(doc._id, (err, resp) => {
      if (err) {
        if (err.status === 404) {
          req.db.put(doc, (errr, respp) => {
            if (errr) res.send(err.message);
            else res.send("DB Security installed successfully");
          });
        } else {
          res.send(err.message);
        }
      } else {
        //res.json(resp.security);
        res.json({
          error: false,
          message: "DB Security already installed",
        });
      }
    });
  });

  /** My additions */
  app.get("/:db/_get_db_security", adminOnly, function (req, res) {
    req.db.get(`_local/${process.env.LOCAL_DOC_KEY}`, (err, resp) => {
      if (err) res.send(err.message);
      else res.json(resp.security);
    });
  });

  app.post("/:db/_add_admin_name", adminOnly, jsonParser, (req, res) => {
    if (!req.body.name)
      return res.json({
        error: true,
        message: "Please enter a name",
      });
    req.db
      .get(`_local/${process.env.LOCAL_DOC_KEY}`)
      .then(async (doc) => {
        var arr = doc.security.admins.names;
        //console.log(arr);

        if (arr.includes(req.body.name)) {
          // remove
          doc.security.admins.names = arr.filter((r) => r !== req.body.name);
        } else {
          doc.security.admins.names.push(req.body.name);
        }

        return req.db.put(doc);
      })
      .then(() => {
        res.send(`Security document updated`);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });

  app.post("/:db/_add_member_name", adminOnly, jsonParser, (req, res) => {
    if (!req.body.name)
      return res.json({
        error: true,
        message: "Please enter a name",
      });

    req.db
      .get(`_local/${process.env.LOCAL_DOC_KEY}`)
      .then(async (doc) => {
        var arr = doc.security.members.names;

        if (arr.includes(req.body.name)) {
          // remove
          doc.security.members.names = arr.filter((r) => r !== req.body.name);
        } else {
          doc.security.members.names.push(req.body.name);
        }

        return req.db.put(doc);
      })
      .then(() => {
        res.send(`Security document updated`);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });

  app.post("/:db/_add_admin_role", adminOnly, jsonParser, (req, res) => {
    if (!req.body.role)
      return res.json({
        error: true,
        message: "Please enter a role",
      });
    req.db
      .get(`_local/${process.env.LOCAL_DOC_KEY}`)
      .then(async (doc) => {
        var arr = doc.security.admins.roles;
        //console.log(arr);

        if (arr.includes(req.body.role)) {
          // remove
          doc.security.admins.roles = arr.filter((r) => r !== req.body.role);
        } else {
          doc.security.admins.roles.push(req.body.role);
        }

        return req.db.put(doc);
      })
      .then(() => {
        res.send(`Security document updated`);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });

  app.post("/:db/_add_member_role", adminOnly, jsonParser, (req, res) => {
    if (!req.body.role)
      return res.json({
        error: true,
        message: "Please enter a role",
      });
    req.db
      .get(`_local/${process.env.LOCAL_DOC_KEY}`)
      .then(async (doc) => {
        var arr = doc.security.members.roles;

        if (arr.includes(req.body.role)) {
          // remove
          doc.security.members.roles = arr.filter((r) => r !== req.body.role);
        } else {
          doc.security.members.roles.push(req.body.role);
        }

        return req.db.put(doc);
      })
      .then(() => {
        res.send(`Security document updated`);
      })
      .catch((err) => {
        res.send(err.message);
      });
  });
};
