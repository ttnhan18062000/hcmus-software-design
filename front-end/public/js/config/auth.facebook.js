const userModel = require('../../../models/user.model');
const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_CLIENT_ID = '665422371106069';
const FACEBOOK_CLIENT_SECRET = '054521e0e90dd7b7acf911be5a0912e4';

const initializeFackbookPassport = (passport) => { 
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(
        new FacebookStrategy(
            {
                clientID: FACEBOOK_CLIENT_ID,
                clientSecret: FACEBOOK_CLIENT_SECRET,
                callbackURL: 'https://localhost:3000/user/facebook/callback',
                profileFields: ["email", "name"]
            },
            function(accessToken, refreshToken, profile, done) {
                const { email, first_name, last_name } = profile._json;
                const userData = {
                    email,
                    firstName: first_name,
                    lastName: last_name
                };
                console.log(userData);
                done(null, profile);
            }
        )
    );
}

module.exports = initializeFackbookPassport;