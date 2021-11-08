const express = require('express');
const router = express.Router();
const {
    checkNotAuthenticated,
    checkAuthenticated,
} = require('../models/user.model');

const passport = require('passport');

const { HTTP } = require('http-call');
const userURL = require('../../configs/services-url.json')['user-service'];

router.get('/userInfo', checkAuthenticated, async function (req, res) {
    const user = await req.user.then((user) => user);
    const { body: data } = await HTTP.get(
        encodeURI(userURL + '/userInfo?user=' + JSON.stringify(user))
    );
    res.render('vwCategories/userInfo', data);
});

router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.route('/google/callback').get(
    passport.authenticate('google', {
        failureRedirect: '/user/sign_in',
    }),
    function (req, res) {
        // here everything works. req.user is correctly set and req.isAuthenticated() is true
        console.log('is au: ', req.isAuthenticated());

        req.session.save(function (err) {
            res.redirect('/');
        });
    }
);

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/user/sign_in',
    })
);

router.get('/sign_in', checkNotAuthenticated, function (req, res) {
    res.render('vwCategories/sign_in');
});

router.get('/otp/:username', function (req, res) {
    const username = req.params.username;
    console.log(req.params.username);
    res.render('vwUser/otp', { username: username });
});

router.get('/otppassword', function (req, res) {
    req.user.then(async (user) => {
        const username = user.user_name;
        await HTTP.get(
            encodeURI(userURL + '/otppassword?user=' + JSON.stringify(user))
        );
        res.render('vwUser/otpPassword', { username: username });
    });
});

router.post('/verifyEmail', async function (req, res) {
    const email = req.body.email;
    const { body: data } = await HTTP.post(
        encodeURI(userURL + '/verifyEmail?email=' + email)
    );
    if (data.status == false) {
        res.render('vwUser/forgetPassword', {
            message: 'No such email exists!',
        });
    } else {
        const username = data.username;
        res.render('vwUser/otpPassword', {
            username: username,
        });
    }
});

router.get('/forgetPassword', (req, res) => {
    res.render('vwUser/forgetPassword');
});

router.get('/editArticle/:id', function (req, res) {
    res.render('vwUser/otp', { username: username });
});

router.post('/resentotp', async function (req, res) {
    const username = req.body.username;
    await HTTP.post(encodeURI(userURL + '/resentotp?username=' + username));

    res.render('vwUser/otp', {
        username: username,
        message: 'We have resended the OTP to your email.',
    });
});

router.get('/subscribe', checkAuthenticated, function (req, res) {
    res.render('vwUser/subscription.hbs');
});

router.post('/otpConfirm', async (req, res) => {
    const currOTP = req.body.otp;
    const username = req.body.username;

    const { body: data } = await HTTP.post(
        encodeURI(
            userURL + '/otpConfirm?otp=' + currOTP + '&username=' + username
        )
    );

    if (data.status) {
        const message = data.message;
        return res.render('vwUser/waiting', {
            message: message,
        });
    } else {
        const message = data.message;
        const username = data.username;
        return res.render('vwUser/otp', {
            message: message,
            username: username,
        });
    }
});

router.post('/otpConfirmPassword', async (req, res) => {
    const currOTP = req.body.otp;
    const username = req.body.username;
    const password = req.body.password;
    const passwordRepeat = req.body.password_repeat;
    const { body: data } = await HTTP.post(
        encodeURI(
            userURL +
                '/otpConfirmPassword?otp=' +
                currOTP +
                '&username=' +
                username +
                '&password=' +
                password +
                '&password_repeat=' +
                passwordRepeat
        )
    );
    const message = data.message;

    res.render('vwUser/otpPassword', {
        message: message,
        username: username,
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/changeInfo', (req, res) => {
    req.user.then(async (user) => {
        let newUser = user;
        newUser['name'] = req.body.name;
        newUser['email'] = req.body.email;
        newUser['birthday'] = req.body.birthdate.split('/').reverse().join('-');
        console.log(newUser);
        await HTTP.post(
            encodeURI(
                userURL + '/changeInfo?newUser=' + JSON.stringify(newUser)
            )
        );

        res.render('vwUser/waiting', {
            message: 'Your info has been changed!',
        });
    });
});

router.post('/subscribe', function (req, res) {
    req.user.then(async (user) => {
        const userID = user.id;
        const nDaybuy = req.body.no_day_buy;
        await HTTP.post(
            encodeURI(
                userURL + '/subscribe?userID=' + userID + '&nDaybuy=' + nDaybuy
            )
        );

        const msg =
            'Your buying will be reviewed by the admin. And will be updated later';
        res.render('vwUser/waiting', { message: msg });
    });
});

router.get('/register', function (req, res) {
    res.render('vwCategories/register');
});

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/sign_in',
        failureFlash: true,
    })
);

router.post('/register', async (req, res) => {
    if (
        req.body.capcha === undefined ||
        req.body.capcha === '' ||
        req.body.capcha === null
    ) {
        return res.json({ success: false, mgs: 'Please check the Capcha!' });
    }

    const newUser = {
        name: req.body.name,
        email: req.body.email,
        user_name: req.body.username,

        birthday: req.body.birthdate.split('/').reverse().join('-'),
    };

    const { body: data } = await HTTP.post(
        encodeURI(
            userURL +
                '/register?remoteAddress=' +
                req.socket.remoteAddress +
                '&capcha=' +
                req.body.capcha +
                '&password=' +
                req.body.password +
                '&newUser=' +
                JSON.stringify(newUser)
        )
    );
    console.log(data);
    if (data == false) {
        res.redirect('/register');
    }

    return res.json(data);
});

module.exports = router;
