const express = require('express');

const { checkAuthenticated, isAdmin } = require('../models/user.model');
const { HTTP } = require('http-call');
const adminURL = require('../../configs/services-url.json')['admin-service'];

const router = express.Router();

router.get('/posts', checkAuthenticated, isAdmin, async function (req, res) {
    const { body: data } = await HTTP.get(encodeURI(adminURL + '/admin/posts'));
    const articles = data.articles;

    res.render('vwAdmin/posts', {
        layout: 'admin.hbs',
        postActive: true,
        articles,
    });
});

router.get(
    '/posts/edit',
    checkAuthenticated,
    isAdmin,
    async function (req, res) {
        const articleID = req.query.id;
        const { body: data } = await HTTP.get(
            encodeURI(adminURL + '/admin/posts/edit?articleID=' + articleID)
        );
        if (!data.result) {
            return res.redirect('/admin/posts');
        }
        const article = data.article;

        const author = data.author;

        const editor = data.editor;

        const articleTags = data.articleTags;

        const catList = data.catList;

        res.render('vwAdmin/editPost', {
            layout: 'admin.hbs',
            postActive: true,
            article,
            articleTags,
            catList,
            author,
            editor,
        });
    }
);

router.post('/posts/patch', async function (req, res) {
    req.user.then(async (user) => {
        const articleID = req.query.id;
        await HTTP.post(
            encodeURI(
                adminURL +
                    '/admin/posts/patch?articleID=' +
                    articleID +
                    '&body=' +
                    JSON.stringify(req.body) +
                    '&userID=' +
                    user.id
            )
        );

        res.redirect('/admin/posts');
    });
});

router.post('/posts/del', async function (req, res) {
    const articleID = req.query.id;

    await HTTP.post(
        encodeURI(adminURL + '/admin/posts/del?articleID=' + articleID)
    );

    res.redirect('/admin/posts');
});
module.exports = router;
