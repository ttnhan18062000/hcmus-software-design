const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');

const router = express.Router();

router.get('/users', async function (req, res) {
    const userList = await userModel.allUserByType(0);

    return res.json({ userList });
});

router.post('/users/add', function (req, res) {
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

router.get('/users/edit', async function (req, res) {
    const id = JSON.parse(decodeURI(req.query.id));
    const userDetail = await userModel.findByID(id);

    if (userDetail === null) {
        return res.json({ result: false });
    }

    return res.json({
        result: true,
        userDetail,
    });
});

router.post('/users/patch', async function (req, res) {
    console.log('patch');
    const updatedUser = JSON.parse(decodeURI(req.query.updatedUser));
    await userModel.patch(updatedUser);

    return res.json(true);
});

router.post('/users/del', async function (req, res) {
    const userID = JSON.parse(decodeURI(req.query.userID));
    await userModel.del(userID);
    return res.json(true);
});

router.post('/users/extendSubcription', async function (req, res) {
    const userID = JSON.parse(decodeURI(req.query.userID));

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

    return res.json(true);
});

router.get('/users/pending', async function (req, res) {
    const userList = await userModel.getPendingSub();

    return res.json({ userList });
});
router.post('/users/approve', async function (req, res) {
    const body = JSON.parse(decodeURI(req.query.body));

    const userID = body.userID;

    const dueTime = moment(body.subcription_due_date);

    const curTime = moment();

    const diffTime = dueTime.diff(curTime, 'seconds');

    let newDueTime = '';
    const day = body.days_subscribe;

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

    await userModel.delPendingSubApproved(body.id);

    return res.json(true);
});
//-----------------------------------------------------------------------------------------------------------------------------------------

module.exports = router;
