const express = require('express');
const router = express.Router();
const { addUser, updateSubdate } = require('../models/user.model');
const bcrypt = require('bcryptjs');

const request = require('request');
const moment = require('moment');
const userModel = require('../models/user.model');
const sendMail = require('../helper/sendEmail.js');

const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

router.get('/userInfo', async function (req, res) {
    const user = JSON.parse(decodeURI(req.query.user));
    let subDate = 'You have not subscribe yet';

    if (user.subcription_due_date) {
        const subDateMoment = moment(user.subcription_due_date);
        if (subDateMoment.isAfter()) {
            subDate = subDateMoment.format('dddd, MMMM Do YYYY, h:mm:ss a');
        }
    }
    console.log(user);
    const penname = await userModel.findPenNameByID(user.id);
    res.json({
        user_name: user.user_name,
        name: user.name,
        email: user.email,
        birthdate: moment(user.birthday).format('DD-MM-YYYY'),
        subscribeDate: subDate,
        penname: penname,
    });
});

router.post('/register', (req, res) => {
    const remoteAddress = req.query.remoteAddress;
    const capcha = req.query.capcha;
    const password = req.query.password;
    const newUser = JSON.parse(req.query.newUser);
    console.log(newUser);

    const secretKey = '6Lc-5wgcAAAAAM2u5M7P-r2RbIJtm3keKDRYg2PJ';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${capcha}
    &remoteip=${remoteAddress}`;

    request(verifyUrl, async (err, response, body) => {
        body = JSON.parse(body);

        if (body.success !== undefined && !body.success) {
            return res.json({
                success: false,
                mgs: 'Fail Capcha verification',
            });
        }
        let hashedPassword;

        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch {
            res.json(false);
        }

        const generatedOTP = generateOTP();
        const user = {
            name: newUser.name,
            email: newUser.email,
            user_name: newUser.user_name,
            password: hashedPassword,
            birthday: newUser.birthday.split('/').reverse().join('-'),
            user_type: 0,
            otp: generatedOTP,
        };

        try {
            await addUser(user);

            console.log('success registing user');
            sendMail(
                user.email,
                user.name,
                'News Registing Conformation Email',
                'This is your conformation email for registing at News',
                user.otp
            );
            console.log('here');
            return res.json({
                success: true,
                mgs: 'Success',
                username: user.user_name,
            });
        } catch (err) {
            console.log(err);
            return res.json({ success: true, mgs: 'Error on server side' });
        }
    });
});

router.post('/otpConfirm', async (req, res) => {
    const currOTP = req.query.otp;
    const username = req.query.username;
    const user = await userModel.findByUsername(username);
    if (currOTP === user.otp) {
        userModel.activateUser(user.id).then(
            () =>
                res.json({
                    status: true,
                    message: 'Your account is activated!',
                })
            // res.render('vwUser/waiting', {

            // })
        );
    } else {
        res.json({
            status: false,
            message: 'Wrong OTP code!',
            username: username,
        });
    }
});

router.post('/resentotp', async function (req, res) {
    const username = req.query.username;

    const user = await userModel.findByUsername(username);
    sendMail(
        user.email,
        user.name,
        'News Registing Conformation Email',
        'This is your conformation email for registing at News',
        user.otp
    );

    return res.json(true);
});

router.post('/changeInfo', (req, res) => {
    let newUser = JSON.parse(req.query.newUser);

    userModel.patch(newUser).then(() => {
        return res.json(true);
    });
});

router.get('/otppassword', function (req, res) {
    const user = JSON.parse(req.query.user);
    console.log('usermail', user);
    sendMail(
        user.email,
        user.name,
        'News Changing Password OTP Email',
        'You have requested a password change at News',
        user.otp
    );
    return res.json(true);
});

router.post('/otpConfirmPassword', async (req, res) => {
    const currOTP = req.query.otp;
    const username = req.query.username;
    const password = req.query.password;
    const passwordRepeat = req.query.password_repeat;
    console.log(password, passwordRepeat);
    const user = await userModel.findByUsername(username);
    if (currOTP === user.otp) {
        if (password === passwordRepeat) {
            const hashedPassword = await bcrypt.hash(password, 10);
            userModel
                .updatePassword(user.id, hashedPassword)
                .then(() =>
                    res.json({ message: 'Your password has been changed!' })
                );
        } else {
            return res.json({
                message: 'Password repeat need to be the same as Password.',
            });
        }
    } else {
        return res.json({
            message: 'Wrong OTP code!',
        });
    }
});

router.post('/verifyEmail', function (req, res) {
    const email = req.query.email;
    userModel.getUserbyEmail(email).then((rows) => {
        if (rows.length === 0) {
            res.json({ status: false });
        } else {
            const user = rows[0];
            sendMail(
                user.email,
                user.name,
                'News Forget Password OTP Email',
                'Use the OTP code to get your password back',
                user.otp
            );
            res.json({ status: true, username: user.user_name });
        }
    });
});

router.post('/subscribe',async function (req, res) {   
    const nDaybuy = +req.query.nDaybuy;
    const userID = req.query.userID;
    
    await userModel.addPendingSubscribe(userID, nDaybuy);

    return res.json(true);
});

module.exports = router;
