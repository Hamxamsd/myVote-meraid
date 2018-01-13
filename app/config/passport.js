'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
        console.log('serializing');
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
        console.log('deserializing');

		User.findById(id,{hashed_password:0,salt:0}, function (err, user) {
			done(err, user);
		});
	});

	// passport.use(new GitHubStrategy({
	// 	clientID: configAuth.githubAuth.clientID,
	// 	clientSecret: configAuth.githubAuth.clientSecret,
	// 	callbackURL: configAuth.githubAuth.callbackURL
	// },
	// function (token, refreshToken, profile, done) {
	// 	process.nextTick(function () {
	// 		User.findOne({ 'github.id': profile.id }, function (err, user) {
	// 			if (err) {
	// 				return done(err);
	// 			}

	// 			if (user) {
	// 				return done(null, user);
	// 			} else {
	// 				var newUser = new User();

	// 				newUser.github.id = profile.id;
	// 				newUser.github.username = profile.username;
	// 				newUser.github.displayName = profile.displayName;
	// 				newUser.github.publicRepos = profile._json.public_repos;
	// 				newUser.nbrClicks.clicks = 0;

	// 				newUser.save(function (err) {
	// 					if (err) {
	// 						throw err;
	// 					}

	// 					return done(null, newUser);
	// 				});
	// 			}
	// 		});
	// 	});
    // }));
    
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
  function(username, password, done) {
      console.log(username+'----'+password);
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (validPassword(password,user)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

function validPassword(password, user){
    let temp = user.salt; 
	let hash_db = user.hashed_password; 
			// let id = users[0].token; 
    let newpass = temp + password; 
    let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
    return hashed_password==password; 
			//
}

};