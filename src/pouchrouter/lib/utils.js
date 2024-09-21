"use strict";
var sanitize = require("sanitize-filename");

module.exports.sendError = function (res, err, baseStatus) {
  var status = err.status || baseStatus || 500;
  if (err.name && err.message) {
    err = {
      error: err.name,
      reason: err.message,
    };
  }
  module.exports.sendJSON(res, status, err);
};

module.exports.sendJSON = function (res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.send(Buffer.from(JSON.stringify(body) + "\n", "utf8"));
};

/**
 * clean filename for pouchdb database name
 * @param {string} name
 * @returns string
 */
module.exports.cleanFilename = function (name) {
  // some windows reserved names like 'con' and 'prn'
  // return an empty string here, so just wrap them in
  // double underscores so it's at least something
  return sanitize(name) || sanitize("__" + name + "__");
};

/**
 *
 * @param {*} req
 * @param {*} startOpts
 */
module.exports.makeOpts = function (req, startOpts) {
  // fill in opts so it can be used by authorisation logic
  var opts = startOpts || {};

  opts.userCtx = req.couchSession.userCtx || { name: null, roles: ["guest"] };
  opts.secObj = req.couchSecurityObj || {};

  if (opts.userCtx) {
    // add db name to userCtx
    var dbname = req.db && req.db._db_name;
    if (dbname) {
      // opts.userCtx.db = decodeURIComponent(dbname);
      opts.userCtx.db = module.exports.cleanFilename(dbname);
    }
  }
  return opts;
};

module.exports.nodify = function (promise, callback) {
  if (typeof callback === "function") {
    promise.then(
      function (resp) {
        callback(null, resp);
      },
      function (err) {
        callback(err, null);
      }
    );
  }
};
