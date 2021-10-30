const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');
const path = require('path');
const categoryModel = require('../models/category.model');
const multer = require('multer');
const postingModel = require('../models/posting.model');
const tagModel = require('../models/tag.model');
const userModel = require('../models/user.model');
const { checkAuthenticated, isWriter } = require('../models/user.model');

const {HTTP} = require('http-call');
const userURL = require('../../configs/services-url.json')['user-service'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/article_img'))
    },
    filename: (req, file, cb) => {
        //console.log(file);
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

const getArticles = async (authorId, approvalStatus, res) => {
    const {body: data} = await HTTP.get(encodeURI(userURL + '/getArticles?authorId=' + authorId + "&approvalStatus=" + approvalStatus));
    switch (approvalStatus) {
        case 'Chưa được duyệt':
            return res.render('vwWriter/writer', data);
            break;
        case 'Đã xuất bản':
            return res.render('vwWriter/writer_published', data);
            break;
        case 'Bị từ chối':
            return res.render('vwWriter/writer_rejected', data);
            break;
        default:
            return res.render('vwWriter/writer_pending', data);
            break;
    }
}

router.post('/rejectReason', async(req, res) => {
    console.log(req.body);

    const articleID = parseInt(req.body.articleID);
    const editor_id = parseInt(req.body.editor_id);
    const {body: data} = await HTTP.post(encodeURI(userURL + '/rejectReason?articleID=' + articleID + "&editor_id=" + editor_id));
    return res.render('vwWriter/rejectedReason', data);
});


router.get('/writer', checkAuthenticated, isWriter, function(req, res) {
    req.user.then((user) => {
        const id = user.id;
        getArticles(id, 'Chưa được duyệt', res);
    });
})

router.get('/writer/rejected', checkAuthenticated, isWriter, function(req, res) {
    req.user.then((user) => {
        const id = user.id;
        getArticles(id, 'Bị từ chối', res);
    });
})

router.get('/writer/pending', checkAuthenticated, isWriter, function(req, res) {
    req.user.then((user) => {
        const id = user.id;
        getArticles(id, 'Đã được duyệt & chờ xuất bản', res);
    });
})

router.get('/writer/published', checkAuthenticated, isWriter, function(req, res) {
    req.user.then((user) => {
        const id = user.id;
        getArticles(id, 'Đã xuất bản', res);
    });
})

router.get('/editArticle/:id', checkAuthenticated, isWriter, async function(req, res) {
    const id = req.params.id;
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editArticle?id=' + id));
    return res.render('vwWriter/postingEdit.hbs', data);
});

router.get('/getArticleContent/:id', checkAuthenticated, isWriter, async function(req, res) {
    const id = req.params.id;
    const {body: data} = await HTTP.get(encodeURI(userURL + '/getArticleContent?id=' + id));
    console.log("here");
    return res.send(data);
});

router.get('/posting', checkAuthenticated, isWriter, async function(req, res) {
    const {body: data} = await HTTP.get(encodeURI(userURL + '/posting'));
    return res.render('vwWriter/posting.hbs', data);
});

router.post('/post_article', async (req, res) => {
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.post(encodeURI(userURL + '/post_article?user=' + JSON.stringify(user) + '&body=' + JSON.stringify(req.body) + '&file=' + JSON.stringify(req.file)));
    return res.redirect('/posting');
})

router.post('/upload_img', async (req, res) => {
    const {body: data} = await HTTP.post(encodeURI(userURL + '/upload_img?body=' + JSON.stringify(req.body) + '&file=' + JSON.stringify(req.file)));
    return res.json(data);
});

module.exports = router;