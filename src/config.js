module.exports = {
  port: process.env.PORT || 8080,
  domain: process.env.DETA_SPACE_APP_HOSTNAME || "localhost",
  secret: process.env.PASSPORT_SECRET || "F0rh@dzxy987Vsadxiew6",
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET ||
    "F0rh@dzxy987Vsadxiew69dsfbdshwbvJFA86fsdjgThjjkgfghdfhsdf",

  sessionID: process.env.SESSION_ID || "fabSessId",
  authDB: process.env.AUTH_DB || "fab_auth",
  aclDB: process.env.ACL_DB || "fab_acl",
  /** user  default groups */
  aclGuestRole: process.env.ACL_GUEST_ROLE || "guest",
  aclAdminRole: process.env.ACL_ADMIN_ROLE || "admin",
};
