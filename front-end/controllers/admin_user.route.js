const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];
const router = express.Router();

router.get('/users', checkAuthenticated, isAdmin, async function (req, res) {
    const { body: data } = await HTTP.get(encodeURI(adminURL + '/admin/users'));
    const userList = data.userList;

    const curTime = moment();

    for (u of userList) {
        const dueTime = moment(u.subcription_due_date);
        const diffTime = dueTime.diff(curTime, 'seconds');

        if (isNaN(diffTime) || diffTime < 0) {
            u.account_type = 'Thường';
        } else {
            u.account_type = 'Premium';
        }
    }

    res.render('vwAdmin/users', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userActive: true,
        userList,
    });
});

router.get('/users/add', checkAuthenticated, isAdmin, function (req, res) {
    res.render('vwAdmin/addUser', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userActive: true,
    });
});

router.post('/users/add', async function (req, res) {
    const hash = bcrypt.hashSync(req.body.raw_password, 10);

    const user = {
        user_name: req.body.user_name,
        password: hash,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        user_type: 0,
        is_active: true,
    };

    await HTTP.post(
        encodeURI(adminURL + '/admin/users/add?user=' + JSON.stringify(user))
    );
    res.redirect('/admin/users/add');
});

router.get('/is-username-available', async function (req, res) {
    const username = req.query.username;
    const user = await userModel.findByUsername(username);
    if (user === null) {
        return res.json(true);
    }

    res.json(false);
});

router.get(
    '/users/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/users/edit?id=' + req.query.id)
        );

        if (!data.result) {
            return res.redirect('/admin/users');
        }

        const userDetail = data.userDetail;
        userDetail.birthday = moment(userDetail.birthday).format('YYYY-MM-DD');

        const dueTime = moment(userDetail.subcription_due_date);

        const curTime = moment();

        const diffTime = dueTime.diff(curTime, 'seconds');

        if (isNaN(diffTime) || diffTime < 0) {
            userDetail.subcription_due_date = 'Đã hết hạn';
        } else {
            userDetail.subcription_due_date = dueTime.format(
                'YYYY-MM-DD HH:mm:ss'
            );
        }

        res.render('vwAdmin/editUser', {
            layout: 'admin.hbs',
            userMenuActive: true,
            userActive: true,
            userDetail,
        });
    }
);

router.post('/users/patch', async function (req, res) {
    console.log('patch');
    console.log(req.body);
    let updatedUser = {};
    if (req.body.newpass.length != 0) {
        const hash = bcrypt.hashSync(req.body.newpass, 10);
        updatedUser = {
            id: req.query.id,
            name: req.body.name,
            email: req.body.email,
            birthday: req.body.birthday,
            password: hash,
        };
    } else {
        updatedUser = {
            id: req.query.id,
            name: req.body.name,
            email: req.body.email,
            birthday: req.body.birthday,
        };
    }

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/users/patch?updatedUser=' +
                JSON.stringify(updatedUser)
        )
    );

    res.redirect('/admin/users');
});

router.post('/users/del', async function (req, res) {
    const userID = req.query.id;

    await HTTP.post(encodeURI(adminURL + '/admin/users/del?userID=' + userID));
    res.redirect('/admin/users');
});

router.post('/users/extendSubcription', async function (req, res) {
    const userID = req.query.id;
    const url = req.headers.referer || '/admin/users';

    await HTTP.post(
        encodeURI(adminURL + '/admin/users/extendSubcription?userID=' + userID)
    );

    res.redirect(url);
});

router.get(
    '/users/pending',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/users/pending')
        );
        const userList = data.userList;
        res.render('vwAdmin/pending', {
            layout: 'admin.hbs',
            userMenuActive: true,
            pending: true,
            userList,
        });
    }
);
router.post('/users/approve', async function (req, res) {
    await HTTP.post(
        encodeURI(
            adminURL + '/admin/users/approve?body=' + JSON.stringify(req.body)
        )
    );

    res.redirect('/admin/users/pending');
});
//-----------------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
