const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Auth = require("../libs/auth");

module.exports = (app) => {
  const localLogin = new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Auth.login(username, password, (error, user) => {
        if (error) {
          return done(null, false, error);
        }
        if (!user) {
          return done(null, false, {
            error: true,
            message: "Login failed",
            reason: "Login failed",
          });
        }
        //console.log(user);
        
        return done(null, user);
      });
    }
  );

  let jwtLogin = new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: app.locals.config.secret,
    },
    function (jwtPayload, done) {
      Auth.findUserById(jwtPayload.id, (err, user) => {
        if (err) {
          return done(err, null);
        }
        return done(null, user);
      });
    }
  );

  passport.use(localLogin);
  passport.use(jwtLogin);

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, user);
      //cb(null, { id: user.email, username: user.name,role: user.roles });
      //cb(null, { id: user.email, username: user.name });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.set("auth", Auth);
};
