const express = require('express');
const categoryModel = require('../models/category.model');

const router = express.Router();

router.get('/categories/add', async function (req, res) {
    res.render('vwAdmin/addCategory', {
        layout: 'admin.hbs',
        categoryActive: true,
    });
});

router.post('/categories/add', async function (req, res) {
    const newCategory = JSON.parse(decodeURI(req.query.newCategory));
    await categoryModel.add(newCategory);
    return res.json(true);
});

router.get(
    '/categories/edit',

    async function (req, res) {
        const categoryId = req.query.categoryId;

        const categoryDetail = await categoryModel.findByID(categoryId);

        if (categoryDetail === null) {
            return res.json({ result: false });
        }

        return res.json({ result: true, categoryDetail });
    }
);

router.post('/categories/patch', async function (req, res) {
    const updatedCategory = JSON.parse(decodeURI(req.query.updatedCategory));
    await categoryModel.patch(updatedCategory);

    return res.json(true);
});

router.post('/categories/del', async function (req, res) {
    const catID = req.query.catID;
    const catParentID = req.query.catParentID;

    await categoryModel.del(catID, catParentID);

    return res.json(true);
});

module.exports = router;
