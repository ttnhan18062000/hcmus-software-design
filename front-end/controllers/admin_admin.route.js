const express = require('express');
const bcrypt = require('bcryptjs');
const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];
const router = express.Router();

router.get(
    '/usersAdmin',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/usersAdmin')
        );
        const adminList = data.adminList;
        res.render('vwAdmin/usersAdmin', {
            layout: 'admin.hbs',
            userMenuActive: true,
            userAdminActive: true,
            adminList,
        });
    }
);

router.get('/usersAdmin/add', checkAuthenticated, isAdmin, function (req, res) {
    res.render('vwAdmin/addUserAdmin', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userAdminActive: true,
    });
});

router.post('/usersAdmin/add', async function (req, res) {
    const hash = bcrypt.hashSync(req.body.raw_password, 10);
    const user = {
        user_name: req.body.user_name,
        password: hash,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        user_type: 3,
        is_active: true,
    };
    const data = JSON.stringify(user);
    await HTTP.post(
        encodeURI(adminURL + '/admin/usersAdmin/add' + '?user=' + data)
    );

    return res.redirect('/admin/usersAdmin/add');
});

router.get(
    '/usersAdmin/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/usersAdmin/edit?id=' + req.query.id)
        );
        if (!data.result) {
            return res.redirect('/admin/usersAdmin');
        }

        const userDetail = data.userDetail;

        res.render('vwAdmin/editUserAdmin', {
            layout: 'admin.hbs',
            userMenuActive: true,
            userAdminActive: true,
            userDetail,
        });
    }
);

router.post('/usersAdmin/patch', async function (req, res) {
    console.log('usersAdmin patch');

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
                '/admin/usersAdmin/patch?updatedUser=' +
                JSON.stringify(updatedUser)
        )
    );

    res.redirect('/admin/usersAdmin');
});

router.post('/usersAdmin/del', async function (req, res) {
    const userID = req.query.id;

    // await userModel.del(userID);
    await HTTP.post(encodeURI(adminURL + '/admin/usersAdmin/del?id=' + userID));

    res.redirect('/admin/usersAdmin');
});

module.exports = router;
