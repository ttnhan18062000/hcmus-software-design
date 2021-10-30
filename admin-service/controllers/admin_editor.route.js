const express = require('express');
const moment = require('moment');
const userModel = require('../models/user.model');
const assignCatModel = require('../models/assignCat.model');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/editors', async function (req, res) {
    const editorList = await userModel.allUserByType(2);
    return res.json({ editorList });
});

router.post('/editors/add', function (req, res) {
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

router.get('/editors/edit', async function (req, res) {
    const id = JSON.parse(decodeURI(req.query.id));
    const userDetail = await userModel.findByID(id);

    if (userDetail === null) {
        return res.json({ result: false });
    }
    userDetail.birthday = moment(userDetail.birthday).format('YYYY-MM-DD');

    return res.json({ result: true, userDetail });
});

router.post('/editors/patch', async function (req, res) {
    console.log('editor patch');
    const updatedUser = JSON.parse(decodeURI(req.query.updatedUser));

    await userModel.patch(updatedUser);

    return res.json(true);
});

router.post('/editors/del', async function (req, res) {
    req.user.then(async (user) => {
        const userID = JSON.parse(decodeURI(req.query.userID));
        const newID = JSON.parse(decodeURI(req.query.newID));
        await userModel.delEditorInApproval(userID, newID);

        await userModel.delEditorInAssignCat(userID);

        await userModel.del(userID);
        return res.json(true);
    });
});

router.get('/editors/assign', async function (req, res) {
    const id = JSON.parse(decodeURI(req.query.id));
    const userDetail = await userModel.findByID(id);

    if (userDetail === null) {
        return res.json({ result: false });
    }

    const assignedCat = await assignCatModel.findByEditorID(id);
    const unassignedCat = await assignCatModel.findUnassignedCatByEditorID(id);
    console.log({ userDetail, assignedCat, unassignedCat });
    return res.json({
        result: true,
        userDetail,
        assignedCat,
        unassignedCat,
    });
});

router.post('/editors/assign', async function (req, res) {
    console.log(req.query);
    const editorID = JSON.parse(decodeURI(req.query.editorID));

    const tempDeleteAssignedCat = decodeURI(req.query.deleteAssignedCat);

    let deleteAssignedCat =
        tempDeleteAssignedCat !== 'undefined'
            ? JSON.parse(tempDeleteAssignedCat)
            : undefined;

    const tempAssignCat = decodeURI(req.query.assignCat);
    let assignCat =
        tempAssignCat !== 'undefined' ? JSON.parse(tempAssignCat) : undefined;

    console.log({ editorID, deleteAssignedCat, assignCat });

    let addList = [];
    if (typeof assignCat !== 'undefined') {
        try {
            addList = assignCat.map(function (element) {
                const obj = {
                    editor_id: editorID,
                    category_id: +element,
                };
                return obj;
            });
        } catch (error) {
            addList.push({
                editor_id: editorID,
                category_id: +assignCat,
            });
        }
    }

    if (typeof deleteAssignedCat !== 'undefined') {
        if (typeof deleteAssignedCat === 'string') {
            let deleteList = [];
            deleteList.push(deleteAssignedCat);
            await assignCatModel.del(editorID, deleteList);
        } else {
            await assignCatModel.del(editorID, deleteAssignedCat);
        }
    }
    if (addList.length !== 0) await assignCatModel.add(addList);

    return res.json(true);
});

module.exports = router;
