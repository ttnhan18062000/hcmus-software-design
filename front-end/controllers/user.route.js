const express = require('express');
const router = express.Router();
const {addUser, checkNotAuthenticated, checkAuthenticated, updateSubdate} = require('../models/user.model');
const bcrypt = require('bcryptjs');
const initializePassport = require('../public/js/config/passport.config');
const initializeGooglePassport = require('../public/js/config/auth.google.js');

const request = require('request');
const passport = require('passport');
const moment = require('moment');
const userModel = require('../models/user.model');
const sendMail = require('../public/js/sendEmail.js');

const {HTTP} = require('http-call');
const userURL = require('../../configs/services-url.json')['user-service'];

const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

router.get('/userInfo', checkAuthenticated, async function(req, res) {
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.get(encodeURI(userURL + '/userInfo?user=' + JSON.stringify(user)));
    res.render('vwCategories/userInfo', data);
});


router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.route('/google/callback').get(passport.authenticate('google', {
    failureRedirect: '/user/sign_in'
    }), function(req, res) {
        // here everything works. req.user is correctly set and req.isAuthenticated() is true
        console.log("is au: ", req.isAuthenticated());

        req.session.save(function(err) {
            res.redirect('/');
        });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/user/sign_in' }));


router.get('/sign_in', checkNotAuthenticated, function(req, res) {
    res.render('vwCategories/sign_in');
});

router.get('/otp/:username', function(req, res) {
    const username = req.params.username;
    console.log(req.params.username);
    res.render('vwUser/otp', {username: username});
});

router.get('/otppassword', function(req, res) {
    req.user.then((user) => {
        const username = user.user_name;
        console.log('usermail', user);
        sendMail(user.email, user.name, 'News Changing Password OTP Email', 
            "You have requested a password change at News", user.otp);
        res.render('vwUser/otpPassword', {username: username});
    })
});

router.post('/verifyEmail', function(req, res) {
    const email = req.body.email;
    userModel.getUserbyEmail(email).then((rows) => {
        if (rows.length === 0){
            res.render('vwUser/forgetPassword', {message: "No such email exists!"});
        }
        else {
            const user = rows[0];
            sendMail(user.email, user.name, 'News Forget Password OTP Email', 
                "Use the OTP code to get your password back", user.otp);
            res.render('vwUser/otpPassword', {username: user.user_name});
        }
    });
});

router.get('/forgetPassword', (req, res) => {
    res.render('vwUser/forgetPassword');
});


router.get('/editArticle/:id', function(req, res) {
    res.render('vwUser/otp', {username: username});
});

router.post('/resentotp', async function(req, res) {
    const username = req.body.username;
    const user = await userModel.findByUsername(username);
    sendMail(user.email, user.name, 'News Registing Conformation Email', 
                "This is your conformation email for registing at News", user.otp);
    res.render('vwUser/otp', {username: username, message: "We have resended the OTP to your email."});
});

router.get('/subscribe', checkAuthenticated, function(req, res) {
    res.render('vwUser/subscription.hbs');
});

router.post('/otpConfirm', async (req, res) => {
    const currOTP = req.body.otp;
    const username = req.body.username;
    const user = await userModel.findByUsername(username);
    if (currOTP === user.otp){
        userModel.activateUser(user.id).then(() => res.render('vwUser/waiting', {message: "Your account is activated!"}));
    } else {
        res.render('vwUser/otp', {message: "Wrong OTP code!", username: username});
    };
});

router.post('/otpConfirmPassword', async (req, res) => {
    const currOTP = req.body.otp;
    const username = req.body.username;
    const password = req.body.password;
    const passwordRepeat = req.body.password_repeat;
    console.log(password, passwordRepeat);
    const user = await userModel.findByUsername(username);
    if (currOTP === user.otp){
        if (password === passwordRepeat){
            const hashedPassword = await bcrypt.hash(password, 10);
            userModel.updatePassword(user.id, hashedPassword).then(() => res.render('vwUser/waiting', {message: "Your password has been changed!"}));
        }
        else {
            res.render('vwUser/otpPassword', {message: "Password repeat need to be the same as Password.", username: username});
        }
    } else {
        res.render('vwUser/otpPassword', {message: "Wrong OTP code!", username: username});
    };
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

router.post('/changeInfo', (req, res) => {
    req.user.then((user) => {
        let newUser = user;
        newUser['name'] = req.body.name;
        newUser['email'] = req.body.email;
        newUser['birthday'] = req.body.birthdate.split("/").reverse().join("-");
        console.log(newUser);
        userModel.patch(newUser).then(() => {
            res.render('vwUser/waiting', {message: "Your info has been changed!"});
        });
    });
});

router.post('/subscribe', function(req, res) {
    req.user.then((user) => {
        const userID = user.id;
        const nDaybuy = req.body.no_day_buy;
        userModel.addPendingSubscribe(userID, nDaybuy).then(() => {
            const msg = "Your buying will be reviewed by the admin. And will be updated later";
            res.render('vwUser/waiting', {message: msg});
        });
    });
});

router.get('/register', function(req, res) {
    res.render('vwCategories/register');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/sign_in',
    failureFlash: true
}))

router.post('/register', (req, res) => {
    if (
        req.body.capcha === undefined ||
        req.body.capcha === '' ||
        req.body.capcha === null
    )
    {
        return res.json({"success" : false, "mgs": "Please check the Capcha!"});
    }
    const secretKey = '6Lc-5wgcAAAAAM2u5M7P-r2RbIJtm3keKDRYg2PJ';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.capcha}
    &remoteip=${req.socket.remoteAddress}`;

    request(verifyUrl, async (err, response, body) => {
        body = JSON.parse(body);
        
        if (body.success !== undefined && !body.success){
            return res.json({"success" : false, "mgs": "Fail Capcha verification"});
        }
        let hashedPassword;
        try{
            hashedPassword = await bcrypt.hash(req.body.password, 10);
        } catch{
            res.redirect('/register');
        }   

        const generatedOTP = generateOTP();
        const user = {
            name: req.body.name,
            email: req.body.email,
            user_name: req.body.username,
            password: hashedPassword,
            birthday: req.body.birthdate.split("/").reverse().join("-"),
            user_type: 0,
            otp: generatedOTP,
        }

        addUser(user).then(
            () => {
                    console.log("success registing user");
                    sendMail(user.email, user.name, 'News Registing Conformation Email', 
                        "This is your conformation email for registing at News", user.otp);
                    return res.json({"success" : true, "mgs": "Success", "username": user.user_name});
                }
        ).catch( (err) =>
            {
                console.log(err);
                return res.json({"success" : true, "mgs": "Error on server side"});
            }        
        );
    })
});


module.exports = router;