const passport = require("passport");
module.exports.boot = (app) => {
  // login form
  app.get("/dashboard/login", (req, res) => {
    res.render("login");
  });
   
  // login post
  app.post(
    "/dashboard/login",
  passport.authenticate('local', {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: '/dashboard/login',
    failureMessage: true
  }));
      
  // cc   
  // show dashboard
  app.get("/dashboard", (req, res) => {
     if (!req.isAuthenticated()) return res.redirect("/dashboard/login");
    console.log(req.isAuthenticated());
    console.log(req.user);
    
    res.render("dashboard.ejs",{user:req.user});  
  });
};
