const express = require('express');
const bcrypt = require('bcryptjs');
const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];
const router = express.Router();

router.get('/writers', checkAuthenticated, isAdmin, async function (req, res) {
    const { body: data } = await HTTP.get(
        encodeURI(adminURL + '/admin/writers')
    );
    const writerList = data.writerList;

    res.render('vwAdmin/usersWriters', {
        layout: 'admin.hbs',
        userMenuActive: true,
        writerActive: true,
        writerList,
    });
});

router.get('/writers/add', checkAuthenticated, isAdmin, function (req, res) {
    res.render('vwAdmin/addUserWriter', {
        layout: 'admin.hbs',
        userMenuActive: true,
        writerActive: true,
    });
});

router.post('/writers/add', async function (req, res) {
    const hash = bcrypt.hashSync(req.body.raw_password, 10);

    const user = {
        user_name: req.body.user_name,
        password: hash,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        user_type: 1,
        is_active: true,
    };

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/writers/add?user=' +
                JSON.stringify(user) +
                '&penName=' +
                req.body.penname
        )
    );
    res.redirect('/admin/writers/add');
});

router.get(
    '/writers/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/writers/edit?id=' + req.query.id)
        );

        if (!data.result) {
            return res.redirect('/admin/writers');
        }

        const userDetail = data.userDetail;

        res.render('vwAdmin/editUserWriter', {
            layout: 'admin.hbs',
            userMenuActive: true,
            writerActive: true,
            userDetail,
        });
    }
);

router.post('/writers/patch', async function (req, res) {
    console.log('writer patch');

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

    const writer = {
        user_id: req.query.id,
        pen_name: req.body.pen_name,
    };

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/writers/patch?updatedUser= ' +
                JSON.stringify(updatedUser) +
                '&writer=' +
                JSON.stringify(writer)
        )
    );

    res.redirect('/admin/writers');
});

router.post('/writers/del', async function (req, res) {
    req.user.then(async (user) => {
        const userID = req.query.id;
        const newID = user.id; // ID admin default: 1
        await HTTP.post(
            encodeURI(
                adminURL +
                    '/admin/writers/del?userID= ' +
                    userID +
                    '&newID=' +
                    newID
            )
        );
        res.redirect('/admin/writers');
    });
});

module.exports = router;
