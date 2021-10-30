const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { checkAuthenticated, isAdmin } = require('../models/user.model');

const router = express.Router();

router.get('/users', checkAuthenticated, isAdmin, async function (req, res) {
    const userList = await userModel.allUserByType(0);

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

router.post('/users/add', function (req, res) {
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

    userModel
        .addUser(user)
        .then(() => {
            console.log('success');
        })
        .catch((err) => {
            console.log(err);
        });

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
        const userDetail = await userModel.findByID(req.query.id);

        if (userDetail === null) {
            return res.redirect('/admin/users');
        }

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

    await userModel.patch(updatedUser);

    res.redirect('/admin/users');
});

router.post('/users/del', async function (req, res) {
    const userID = req.query.id;
    await userModel.del(userID);
    res.redirect('/admin/users');
});

router.post('/users/extendSubcription', async function (req, res) {
    const userID = req.query.id;
    const url = req.headers.referer || '/admin/users';

    const user = await userModel.findByID(userID);

    const dueTime = moment(user.subcription_due_date);

    const curTime = moment();

    const diffTime = dueTime.diff(curTime, 'seconds');

    let newDueTime = '';
    const day = 7;

    if (isNaN(diffTime) || diffTime < 0) {
        newDueTime = moment().add(day, 'days');
    } else {
        newDueTime = dueTime.add(day, 'days');
    }

    const extended = {
        id: userID,
        subcription_due_date: newDueTime.format('YYYY-MM-DD HH:mm:ss'),
    };

    await userModel.patch(extended);

    res.redirect(url);
});

router.get(
    '/users/pending',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const userList = await userModel.getPendingSub();
        console.log(userList);

        res.render('vwAdmin/pending', {
            layout: 'admin.hbs',
            userMenuActive: true,
            pending: true,
            userList,
        });
    }
);
router.post('/users/approve', async function (req, res) {
    //const userList = await userModel.getPendingSub();
    console.log(req.body);
    const userID = req.body.userID;

    const dueTime = moment(req.body.subcription_due_date);

    const curTime = moment();

    const diffTime = dueTime.diff(curTime, 'seconds');

    let newDueTime = '';
    const day = req.body.days_subscribe;

    if (isNaN(diffTime) || diffTime < 0) {
        newDueTime = moment().add(day, 'days');
    } else {
        newDueTime = dueTime.add(day, 'days');
    }

    const extended = {
        id: userID,
        subcription_due_date: newDueTime.format('YYYY-MM-DD HH:mm:ss'),
    };

    await userModel.patch(extended);

    await userModel.delPendingSubApproved(req.body.id);

    res.redirect('/admin/users/pending');
});
//-----------------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
