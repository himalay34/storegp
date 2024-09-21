var PouchDBPluginError = require("pouchdb-plugin-error");

function isIn(userCtx, section) {
  return (
    section.names.some(function (name) {
      return name === userCtx.name;
    }) ||
    section.roles.some(function (role) {
      return userCtx.roles.indexOf(role) !== -1;
    })
  );
}

module.exports.adminOnly = function (req, res, next) {
  const adminRole = process.env.ACL_ADMIN_ROLE;
  if (req.couchSession.userCtx.roles.includes(adminRole)) {
    return next();
  } else {
    throw new PouchDBPluginError({
      status: 401,
      name: "unauthorized",
      message:
        "You are not authorized to access this resource. Only Admin can access this resource",
    });
  }
};

module.exports.acl = function (req, rer, next) {
  // is it system db?
  if (req.path.startsWith(process.env.SYSTEM_DB_PATH)) {
    return module.exports.adminOnly(req, res, next);
  }

  // is empty security Object,  means no security docs, public db
  if (Object.keys(req.couchSecurityObj).length === 0) return next();

  var security = req.couchSecurityObj;

  var thereAreAdmins =
    security.admins.names.length || security.admins.roles.length;
  var thereAreMembers =
    security.members.names.length || security.members.roles.length;

  if (thereAreAdmins > 0 || thereAreMembers > 0) {
    if (isIn(req.couchSession.userCtx, security.admins)) {
      // admin check
      return next();
    } else if (
      isIn(req.couchSession.userCtx, security.members) &&
      req.method === "GET"
    ) {
      // user check
      return next();
    } else {
      throw new PouchDBPluginError({
        status: 401,
        name: "unauthorized",
        message: "You are not authorized to access this resource.",
      });
    }
  } else {
    // security doc presents but empty i.e names/roles empty,so it is a public db
    return next();
  }
};
