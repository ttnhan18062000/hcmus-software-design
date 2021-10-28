const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../../../models/user.model');

const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = '202449967032-4gmb95aumk87mhslvc3m01t0ql7k9ks2.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'Txrd5hlz9qzgIuCwTEJ4RmvM';

const { findByUsername, getUserbyId } = require('../../../models/user.model');
const bcrypt = require('bcryptjs');

const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

const initialize = (passport) => {
    const authenticateUser = async(username, password, done) => {
        console.log(username);
        console.log(password);

        const user = await findByUsername(username);
        if (user == null) {
            const mgs = "<b>User is inactive <a href='/user/otp/" + username + "'>Activate account</a></b>";
            return done(null, false, { message: mgs });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                if (user.is_active === 0) {
                    const mgs = "<b>User is inactive <a href='/user/otp/" + username + "'>Activate account</a></b>";
                    return done(null, false, { message: mgs });
                } else {
                    console.log(user);
                    console.log("login successful");
                    return done(null, user);
                }
            } else {
                return done(null, false, { message: "Wrong username or password" });
            }
        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'user_name' }, authenticateUser));

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/user/google/callback",
            passReqToCallback: true
        },
        (request, accessToken, refreshToken, profile, done) => {
            console.log("gegegoogog");
            console.log(profile);
            userModel.getUserGoogleByGoogleID(profile.id).then(async(rows) => {
                if (rows.length === 0) {
                    //userModel.addGoogleUser({googleID: profile.id}).then((user))
                    const user = {
                        name: profile.displayName,
                        email: profile.email,
                        user_name: `google@_${profile.id}`,
                        password: null,
                        birthday: null,
                        user_type: 0,
                        otp: generateOTP(),
                        is_active: 1
                    }

                    userModel.addUser(user).then((idu) => {
                        userModel.addGoogleUser({ id: idu, googleID: profile.id }).then(() => {
                            user['id'] = idu;
                            done(null, user);
                        })
                    })
                } else {
                    console.log("hereer");
                    const id = rows[0].id;
                    const user = await getUserbyId(id);
                    done(null, user);
                }
            });
        }
    ));

    passport.serializeUser((user, done) => {
        console.log('serialize: ', user.id);
        return done(null, user.id)
    });

    passport.deserializeUser((id, done) => {
        return done(null, getUserbyId(id));
    });
};

module.exports = initialize;