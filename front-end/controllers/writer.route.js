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
const { checkAuthenticated, isWriter } = require('../models/user.model');

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

const getArticles = (authorId, approvalStatus, res) => {
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
                res.render('vwWriter/writer', {
                    articles: newArts,
                    wait: true
                });
                break;
            case 'Đã xuất bản':
                res.render('vwWriter/writer_published', {
                    articles: newArts,
                    published: true
                });
                break;
            case 'Bị từ chối':
                res.render('vwWriter/writer_rejected', {
                    articles: newArts,
                    rejected: true
                });
                break;
            default:
                res.render('vwWriter/writer_pending', {
                    articles: newArts,
                    pending_publish: true
                });
                break;
        }
    });
}

router.post('/rejectReason', async(req, res) => {
    console.log(req.body);

    const articleID = parseInt(req.body.articleID);
    const editor_id = parseInt(req.body.editor_id);

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
    res.render('vwWriter/rejectedReason', info);
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

    res.render('vwWriter/postingEdit.hbs', {
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

router.get('/getArticleContent/:id', checkAuthenticated, isWriter, async function(req, res) {
    const id = req.params.id;
    console.log("here");
    const article = await postingModel.findArticleByID2(id);
    let content = article.content.replace(/(?:\r\n|\r|\n)/g, '');
    var response = {
        content: content,
        status: 'success'
    };
    res.send(response)
});

router.get('/posting', checkAuthenticated, isWriter, async function(req, res) {
    const mainCategories = await categoryModel.allMainCategories();
    const subCategories = await categoryModel.allSubCategories();
    const tags = await tagModel.all();

    res.render('vwWriter/posting.hbs', { mainCategories: mainCategories, subCategories: subCategories, tags: tags });
});

router.post('/post_article', (req, res) => {
    req.user.then((user) => {
        let relativePath;
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

            if (req.body.isEdit) {
                const id = article['id'];
                delete article['isEdit'];
                delete article['id'];
                const post = await postingModel.updateArticle(article, tags, id);
                console.log(post);
                // (
                //     () => {
                //         console.log("success posting article");
                //         //console.log(article);
                //         res.redirect('/posting');
                //     }
                // ).catch( (err) =>
                //     {
                //         console.log(err);
                //         return;
                //     }        
                // );
                console.log("success posting article");
                //console.log(article);
                res.redirect('/posting');
            } else {

                addArticle(article, tags).then(
                    () => {
                        console.log("success posting article");
                        console.log(tags);
                        //console.log(article);
                        res.redirect('/posting');
                    }
                ).catch((err) => {
                    console.log(err);
                    return;
                });
            }
        });
    })
})

router.post('/upload_img', (req, res) => {
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
        res.status(200).json({
            uploaded: 1,
            fileName: filename,
            url: url
        });
    })

});

module.exports = router;