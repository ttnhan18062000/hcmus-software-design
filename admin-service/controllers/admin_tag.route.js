const express = require('express');
const tagModel = require('../models/tag.model');
const router = express.Router();

router.get('/', async function (req, res) {
    const tags = await tagModel.all();

    return res.json({ tags });
});

router.post('/tags/add', async function (req, res) {
    const tag = JSON.parse(decodeURI(req.query.tagName));
    await tagModel.add(tag);
    return res.json(true);
});

router.get(
    '/tags/edit',

    async function (req, res) {
        const tagID = +req.query.tagID;
        const tagDetail = await tagModel.findByID(tagID);

        if (tagDetail === null) {
            return res.json({ result: false });
        }

        return res.json({ result: true, tagDetail });
    }
);

router.post('/tags/patch', async function (req, res) {
    const updatedTag = JSON.parse(decodeURI(req.query.updatedTag));
    await tagModel.patch(updatedTag);

    return res.json(true);
});

router.post('/tags/del', async function (req, res) {
    const tagID = +req.query.tagID;
    await tagModel.del(tagID);

    return res.json(true);
});

module.exports = router;
