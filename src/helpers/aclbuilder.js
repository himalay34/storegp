const Zacl = require("../acl").Acl;
const { roles, resources, rules } = require("../aclResources");

module.exports = app => {
    const acl = new Zacl();
  // roles
  roles.forEach((r) => {
    if (!acl.hasRole(r.name)) acl.addRole(r.name, r.parent);
  });
  //resources
  resources.forEach((r) => {
    if (!acl.hasResource(r.name)) acl.addResource(r.name, r.parent);
  });
  // deny all first
  acl.deny();
  //allow admin
  acl.allow("admin");
  rules.forEach((pr) => {
    if (pr.allowed == false) {
      acl.deny(pr.role, pr.resource, pr.permission);
    } else {
      acl.allow(pr.role, pr.resource, pr.permission);
    }
  });

  app.acl = acl;
}