const express = require('express');
const categoryModel = require('../models/category.model');
const {checkAuthenticated,isAdmin} = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];
const router = express.Router();



router.get('/categories', checkAuthenticated, isAdmin, function (req, res) {
    res.render('vwAdmin/categories', {
        layout: 'admin.hbs',
        categoryActive: true,
    });
});

router.get(
    '/categories/add',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        res.render('vwAdmin/addCategory', {
            layout: 'admin.hbs',
            categoryActive: true,
        });
    }
);

router.get(
    '/is-category-available',

    async function (req, res) {
        const title = req.query.title;
        const parent_id = req.query.parent_id;
        const list = await categoryModel.findByParentID(parent_id);
        let titles = [];
        for (c of list) {
            titles.push(c.title.toLowerCase());
        }

        res.json(!titles.includes(title.toLowerCase()));
    }
);

router.post('/categories/add', async function (req, res) {
    const newCategory = req.body;
    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/categories/add?newCategory=' +
                JSON.stringify(newCategory)
        )
    );
    res.redirect('/admin/categories/add');
});

router.get(
    '/categories/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const categoryId = req.query.id;
        const { body: data } = await HTTP.get(
            encodeURI(
                adminURL + '/admin/categories/edit?categoryId=' + categoryId
            )
        );

        if (!data.result) {
            return res.redirect('/admin/categories');
        }
        const categoryDetail = data.categoryDetail;

        const isNotParent =
            categoryDetail.parent_title === 'Không' ? false : true;

        res.render('vwAdmin/editCategory', {
            layout: 'admin.hbs',
            categoryActive: true,
            categoryDetail,
            isNotParent,
        });
    }
);

router.post('/categories/patch', async function (req, res) {
    const updatedCategory = {
        id: req.query.id,
        title: req.body.title,
    };

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/categories/patch?updatedCategory=' +
                JSON.stringify(updatedCategory)
        )
    );

    res.redirect('/admin/categories');
});

router.post('/categories/del', async function (req, res) {
    const catID = req.query.id;
    const catParentID = req.query.parent_id;

    await HTTP.post(
        encodeURI(
            adminURL +
                '/admin/categories/del?catID=' +
                catID +
                '&catParentID=' +
                catParentID
        )
    );

    res.redirect('/admin/categories');
});

module.exports = router;
