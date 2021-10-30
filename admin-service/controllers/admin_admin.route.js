const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');

const router = express.Router();

router.get('/usersAdmin', async function (req, res) {
    const adminList = await userModel.allUserByType(3);

    return res.json({
        adminList,
    });
});

router.post('/usersAdmin/add', function (req, res) {
    const user = JSON.parse(decodeURI(req.query.user));
    userModel
        .addUser(user)
        .then(() => {
            console.log('success');
        })
        .catch((err) => {
            console.log(err);
        });

    return res.json(true);
});

router.get(
    '/usersAdmin/edit',

    async function (req, res) {
        const id = JSON.parse(decodeURI(req.query.id));
        const userDetail = await userModel.findByID(id);

        if (userDetail === null) {
            return res.json({ result: false });
        }
        userDetail.birthday = moment(userDetail.birthday).format('YYYY-MM-DD');

        return res.json({ result: true, userDetail });
    }
);

router.post('/usersAdmin/patch', async function (req, res) {
    console.log('usersAdmin patch');
    const updatedUser = JSON.parse(decodeURI(req.query.updatedUser));
    await userModel.patch(updatedUser);
    return res.json(true);
});

router.post('/usersAdmin/del', async function (req, res) {
    const userID = JSON.parse(decodeURI(req.query.id));
    await userModel.del(userID);
    return res.json(true);
});

module.exports = router;
