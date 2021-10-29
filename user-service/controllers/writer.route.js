const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require('fs');
const path = require('path');
const { addArticle, findArticleByAuthorID } = require('../models/posting.model');
const categoryModel = require('../models/category.model');
const multer = require('multer');
const postingModel = require('../models/posting.model');
const tagModel = require('../models/tag.model');
const userModel = require('../models/user.model');
const moment = require('moment');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/article_img'));
    },
    filename: (req, file, cb) => {
        //console.log(file);
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

router.post('/rejectReason', async(req, res) => {
    
    const articleID = decodeURI(req.query.articleID);
    const editor_id = decodeURI(req.query.editor_id);

    const editor = await userModel.getUserbyId(editor_id);

    const info = {
        id: articleID,
        editorName: editor.name,
        editor_id: editor_id,
        title: req.body.title,
        category: req.body.category,
        parent_title: req.body.parent_title,
        rejectedReason: req.body.rejectedReason
    }
    return res.json(info);
});

router.get('/getArticles', function(req, res) {
    const authorId = decodeURI(req.query.authorId);
    const approvalStatus = decodeURI(req.query.approvalStatus);
    findArticleByAuthorID(authorId).then((arts) => {
        //console.log(arts);
        let newArts = arts.map((art) => {
            let approvalStatus = 'Chưa được duyệt';
            let publishdate = moment(art.published_date).format("HH:mm DD-MM-YYYY");
            if (art.editor_id === null)
                approvalStatus = 'Chưa được duyệt';
            else if (art.is_approved === 1) {
                let pubDate = moment(art.published_date);
                if (pubDate.isBefore()) {
                    approvalStatus = 'Đã xuất bản';
                } else {
                    approvalStatus = 'Đã được duyệt & chờ xuất bản';
                }
            } else {
                approvalStatus = 'Bị từ chối';
            }
            return {
                id: art.id,
                title: art.title,
                status: approvalStatus,
                cat_title: art.catTitle,
                parent_title: art.parentCatTitle,
                reject_reason: art.reject_reason,
                editor_id: art.editor_id,
                published_date: publishdate
            };
        });
        newArts = newArts.filter(art => art.status === approvalStatus);

        switch (approvalStatus) {
            case 'Chưa được duyệt':
                return res.json({
                    articles: newArts,
                    wait: true
                });
                break;
            case 'Đã xuất bản':
                return res.json({
                    articles: newArts,
                    published: true
                });
                break;
            case 'Bị từ chối':
                return res.json({
                    articles: newArts,
                    rejected: true
                });
                break;
            default:
                return res.json({
                    articles: newArts,
                    pending_publish: true
                });
                break;
        }
    });
})

router.get('/editArticle', async function(req, res) {
    const id = decodeURI(req.query.id);
    const article = await postingModel.findArticleByID2(id);
    const tagList = await tagModel.findByArticleID(id);
    const mainCategories = await categoryModel.allMainCategories();
    const subCategories = await categoryModel.allSubCategories();
    const allTags = await tagModel.all();


    const approval = await postingModel.getApproval(article.id)
        //console.log(approval);
    let status = "Chưa duyệt";
    if (approval) {
        status = postingModel.checkStatusArticle(approval.is_approved, approval.published_date);
    }
    let disableEdit = true;
    //console.log(article);
    //console.log(status);
    if (status === "Bị từ chối" || status === "Chưa duyệt") {
        disableEdit = false;
    }

    return res.json({
        id: article.id,
        title: article.title,
        abstract: article.abstract,
        thumbnail_image: article.thumbnail_image,
        content: "",
        mainCatID: article.parent_id,
        subCatID: article.cat_id,
        selectedTags: tagList,
        allTags: allTags,
        mainCategories: mainCategories,
        subCategories: subCategories,
        disableEdit: disableEdit
    });
});

router.get('/getArticleContent', async function(req, res) {
    const id = decodeURI(req.query.id);
    console.log("here");
    const article = await postingModel.findArticleByID2(id);
    let content = article.content.replace(/(?:\r\n|\r|\n)/g, '');
    var response = {
        content: content,
        status: 'success'
    };
    return res.json(response);
});

router.get('/posting', async function(req, res) {
    const mainCategories = await categoryModel.allMainCategories();
    const subCategories = await categoryModel.allSubCategories();
    const tags = await tagModel.all();

    return res.json({ mainCategories: mainCategories, subCategories: subCategories, tags: tags });
});

router.post('/post_article', (req, res) => {
    let relativePath;
    req.file = JSON.parse(decodeURI(req.query.file));
    req.body = JSON.parse(decodeURI(req.query.body));
    const user = JSON.parse(decodeURI(req.query.user));
    upload.single('thumbnail_image')(req, res, async function(err) {
        //console.log('body', req.body);
        if (err instanceof multer.MulterError) {
            console.log(err);
        } else if (err) {
            console.log(err);
        }
        if (req.file) {
            relativePath = '/article_img/' + req.file.filename;
        } else {
            relativePath = '/article_img/' + req.body.thumbnail_image;
        }
        //console.log(req.body);
        let article = req.body;
        console.log(article);
        let tags = article['tags'];
        if (article['category_id'] === '-1') {
            article['category_id'] = article['main_category_id'];
        }
        delete article['tags'];
        delete article['main_category_id'];

        article['thumbnail_image'] = relativePath;

        article['created_time'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
        article['author_id'] = user.id;
        console.log(tags);

        if (body.isEdit) {
            const id = article['id'];
            delete article['isEdit'];
            delete article['id'];
            const post = await postingModel.updateArticle(article, tags, id);
            console.log(post);
            console.log("success posting article");
            return res.json(true);
        } else {
            addArticle(article, tags).then(
                () => {
                    console.log("success posting article");
                    console.log(tags);
                    //console.log(article);
                    return res.json(true);
                }
            ).catch((err) => {
                console.log(err);
                return;
            });
        }
    });
})

router.post('/upload_img', (req, res) => {
    req.file = JSON.parse(decodeURI(req.query.file));
    req.body = JSON.parse(decodeURI(req.query.body));
    upload.single('upload')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
        } else if (err) {
            console.log(err);
        }
        console.log(req.file);
        let filename = req.file.filename;
        let url = '/article_img/' + filename;
        let msg = 'Upload successfully';
        let funcNum = req.query.CKEditorFuncNum;
        return res.json({
            uploaded: 1,
            fileName: filename,
            url: url
        });
    })

});

module.exports = router;