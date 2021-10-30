const userModel = require('../../../models/user.model');


const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = '202449967032-4gmb95aumk87mhslvc3m01t0ql7k9ks2.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'Txrd5hlz9qzgIuCwTEJ4RmvM';


const initializeGooglePassport = (passport) => {
    passport.use(new GoogleStrategy(
        {
            clientID:     GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/user/google/callback",
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, done) {
            console.log(profile);
            return done(err, profile);
        }
        // (accessToken, refreshToken, profile, done) => {
        //     console.log("gegegoogog");
        //     userModel.getUserGoogleByGoogleID(profile.id).then((rows) => {
        //         if (rows.length === 0){
        //             const user = rows[0];
        //             done(null, user);
        //         } else {
        //             console.log(profile);
        //             done(null, {id: profile.id});
        //         }
        //     });
        // }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        userModel.getUserGoogleByGoogleID(id).then((rows) => {
            done(null, rows[0]);
        });
    });
}

module.exports = initializeGooglePassport;