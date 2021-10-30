const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/writers', async function (req, res) {
    const writerList = await userModel.allWriter();
    return res.json({ writerList });
});

router.post('/writers/add', async function (req, res) {
    const user = JSON.parse(decodeURI(req.query.user));

    const penName = req.query.penName;
    userModel
        .addUser(user)
        .then(async (id) => {
            const writer = {
                user_id: id,
                pen_name: penName,
            };

            await userModel.addPenName(writer);
        })
        .catch((err) => {
            console.log(err);
        });

    return res.json(true);
});

router.get(
    '/writers/edit',

    async function (req, res) {
        const id = JSON.parse(decodeURI(req.query.id));
        const userDetail = await userModel.findByID(id);

        if (userDetail === null) {
            return res.json({ result: false });
        }
        userDetail.birthday = moment(userDetail.birthday).format('YYYY-MM-DD');

        userDetail.pen_name = await userModel.findPenNameByID(id);
        return res.json({
            result: true,
            userDetail,
        });
    }
);

router.post('/writers/patch', async function (req, res) {
    console.log('writer patch');
    const updatedUser = JSON.parse(decodeURI(req.query.updatedUser));
    const writer = JSON.parse(decodeURI(req.query.writer));

    //update in users table
    await userModel.patch(updatedUser);

    //update pen_name
    await userModel.patchPenName(writer);

    return res.json(true);
});

router.post('/writers/del', async function (req, res) {
    const userID = JSON.parse(decodeURI(req.query.userID));
    const newID = JSON.parse(decodeURI(req.query.newID)); // ID admin default: 1
    await userModel.delWriterArticle(userID, newID);
    await userModel.delPenName(userID);
    await userModel.del(userID);
    return res.json(true);
});

module.exports = router;
