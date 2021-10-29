const express = require('express');
const router = express.Router();
const {addUser, updateSubdate} = require('../models/user.model');
const bcrypt = require('bcryptjs');

const request = require('request');
const moment = require('moment');
const userModel = require('../models/user.model');

const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

router.get('/userInfo', async function(req, res) {
    const user = JSON.parse(decodeURI(req.query.user));
    let subDate = "You have not subscribe yet";
    
    if (user.subcription_due_date){
        const subDateMoment = moment(user.subcription_due_date);
        if (subDateMoment.isAfter()){
            subDate = subDateMoment.format("dddd, MMMM Do YYYY, h:mm:ss a");
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
        penname: penname
    });
});

module.exports = router;