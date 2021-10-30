const express = require('express');
const bcrypt = require('bcryptjs');
const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];

const router = express.Router();

router.get('/editors', checkAuthenticated, isAdmin, async function (req, res) {
    const { body: data } = await HTTP.get(
        encodeURI(adminURL + '/admin/editors')
    );
    const editorList = data.editorList;

    return res.render('vwAdmin/usersEditors', {
        layout: 'admin.hbs',
        userMenuActive: true,
        editorActive: true,
        editorList,
    });
});
router.get('/editors/add', checkAuthenticated, isAdmin, function (req, res) {
    res.render('vwAdmin/addUserEditor', {
        layout: 'admin.hbs',
        userMenuActive: true,
        editorActive: true,
    });
});
router.post('/editors/add', async function (req, res) {
    const hash = bcrypt.hashSync(req.body.raw_password, 10);

    const user = {
        user_name: req.body.user_name,
        password: hash,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        user_type: 2,
        is_active: true,
    };

    await HTTP.post(
        encodeURI(adminURL + '/admin/editors/add?user=' + JSON.stringify(user))
    );

    res.redirect('/admin/editors/add');
});

router.get(
    '/editors/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/editors/edit?id=' + req.query.id)
        );
        if (!data.result) {
            return res.redirect('/admin/editors');
        }

        const userDetail = data.userDetail;

        res.render('vwAdmin/editUserEditor', {
            layout: 'admin.hbs',
            userMenuActive: true,
            editorActive: true,
            userDetail,
        });
    }
);

router.post('/editors/patch', async function (req, res) {
    console.log('editor patch');

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
                '/admin/editors/patch?updatedUser=' +
                JSON.stringify(updatedUser)
        )
    );

    res.redirect('/admin/editors');
});

router.post('/editors/del', async function (req, res) {
    req.user.then(async (user) => {
        const userID = req.query.id;
        const newID = user.id; // ID admin default: 1
        await HTTP.post(
            encodeURI(
                adminURL +
                    '/admin/editors/del?userID=' +
                    userID +
                    '&newID=' +
                    newID
            )
        );

        res.redirect('/admin/editors');
    });
});

router.get(
    '/editors/assign',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        // const userDetail = await userModel.findByID(req.query.id);
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/editors/assign?id=' + req.query.id)
        );
        if (!data.result) {
            return res.redirect('/admin/editors');
        }

        const assignedCat = data.assignedCat;
        const unassignedCat = data.unassignedCat;
        const userDetail = data.userDetail;

        res.render('vwAdmin/assignEditor', {
            layout: 'admin.hbs',
            userMenuActive: true,
            editorActive: true,
            userDetail,
            assignedCat,
            unassignedCat,
        });
    }
);

router.post('/editors/assign', async function (req, res) {
    const editorID = req.query.id;

    let deleteAssignedCat = req.body.deleteAssignedCat;

    let assignCat = req.body.assignCat;

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/editors/assign?editorID=' +
                editorID +
                '&deleteAssignedCat=' +
                JSON.stringify(deleteAssignedCat) +
                '&assignCat=' +
                JSON.stringify(assignCat)
        )
    );

    res.redirect('/admin/editors');
});

module.exports = router;
