const express = require('express');
const tagModel = require('../models/tag.model');
const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];
const router = express.Router();

router.get('/', checkAuthenticated, isAdmin, async function (req, res) {
    const { body: data } = await HTTP.get(encodeURI(adminURL + '/admin'));
    const tags = data.tags;
    res.render('vwAdmin/tags', {
        layout: 'admin.hbs',
        tagActive: true,
        tags,
    });
});
router.get('/tags/add', checkAuthenticated, isAdmin, async function (req, res) {
    res.render('vwAdmin/addTag', {
        layout: 'admin.hbs',
        tagActive: true,
    });
});
router.post('/tags/add', async function (req, res) {
    const tagName = req.body.tag_name;

    await HTTP.post(
        encodeURI(
            adminURL + '/admin/tags/add?tagName=' + JSON.stringify(tagName)
        )
    );

    res.redirect('/admin/tags/add');
});

router.get(
    '/is-tag-available',

    async function (req, res) {
        const tag_name = req.query.tag_name;
        const list = await tagModel.all();
        let tags = [];
        for (c of list) {
            tags.push(c.tag_name.toLowerCase());
        }

        res.json(!tags.includes(tag_name.toLowerCase()));
    }
);

router.get(
    '/tags/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const tagID = req.query.id;

        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/tags/edit?tagID=' + tagID)
        );
        if (!data.result) {
            return res.redirect('/admin');
        }
        const tagDetail = data.tagDetail;
        res.render('vwAdmin/editTag', {
            layout: 'admin.hbs',
            tagActive: true,
            tagDetail,
        });
    }
);

router.post('/tags/patch', async function (req, res) {
    const updatedTag = {
        id: req.query.id,
        tag_name: req.body.tag_name,
    };

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/tags/patch?updatedTag=' +
                JSON.stringify(updatedTag)
        )
    );

    res.redirect('/admin');
});

router.post('/tags/del', async function (req, res) {
    await HTTP.post(
        encodeURI(adminURL + '/admin/tags/del?tagID=' + req.query.id)
    );

    res.redirect('/admin');
});

module.exports = router;
