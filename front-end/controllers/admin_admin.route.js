const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs');
const {checkAuthenticated,isAdmin} = require('../models/user.model');


const router = express.Router();

router.get('/usersAdmin',checkAuthenticated,isAdmin,  async function (req, res) {

    const adminList = await userModel.allUserByType(3);

    res.render('vwAdmin/usersAdmin', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userAdminActive: true,
        adminList
    });
})

router.get('/usersAdmin/add',checkAuthenticated,isAdmin,  function (req, res) {
    res.render('vwAdmin/addUserAdmin', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userAdminActive: true
    });
})

router.post('/usersAdmin/add',  function (req, res) {
    const hash = bcrypt.hashSync(req.body.raw_password, 10);

    const user = {
        user_name: req.body.user_name,
        password: hash,
        name: req.body.name,
        email: req.body.email,
        birthday: req.body.birthday,
        user_type: 3,
        is_active: true
    }

    userModel.addUser(user).then(
        () => {
            console.log("success")
        }
    ).catch((err) => {
        console.log(err);
    }
    );

    res.redirect('/admin/usersAdmin/add');
})

router.get('/usersAdmin/edit',checkAuthenticated,isAdmin,  async function (req, res) {

    const userDetail = await userModel.findByID(req.query.id);

    if (userDetail === null) {
        return res.redirect('/admin/usersAdmin');
    }
    userDetail.birthday = moment(userDetail.birthday).format("YYYY-MM-DD");

    res.render('vwAdmin/editUserAdmin', {
        layout: 'admin.hbs',
        userMenuActive: true,
        userAdminActive: true,
        userDetail
    });
})

router.post('/usersAdmin/patch',  async function (req, res) {
    console.log("usersAdmin patch");

    let updatedUser = {};
    if (req.body.newpass.length != 0) {
        const hash = bcrypt.hashSync(req.body.newpass, 10);
        updatedUser = {
            id: req.query.id,
            name: req.body.name,
            email: req.body.email,
            birthday: req.body.birthday,
            password: hash,
        }

    }
    else {
        updatedUser = {
            id: req.query.id,
            name: req.body.name,
            email: req.body.email,
            birthday: req.body.birthday,
        }
    }

    await userModel.patch(updatedUser);

    res.redirect('/admin/usersAdmin');
})

router.post('/usersAdmin/del',  async function (req, res) {
    const userID = req.query.id;
    await userModel.del(userID);
    res.redirect('/admin/usersAdmin');
})

module.exports = router;