const express = require('express');
const moment = require('moment');
const postingModel = require('../models/posting.model');
const tagModel = require('../models/tag.model');
const { getAllExceptID } = require('../models/category.model');

const router = express.Router();

router.get('/posts', async function (req, res) {
    const articles = await postingModel.getArticleList();

    for (article of articles) {
        article.status = postingModel.checkStatusArticle(
            article.is_approved,
            article.published_date
        );
    }

    return res.json({ articles });
});

router.get('/posts/edit', async function (req, res) {
    const articleID = +req.query.articleID;
    const article = await postingModel.findByID(articleID);
    if (article === null) {
        return res.json({ result: false });
    }

    const author = await postingModel.findAuthorByArticleID(articleID);

    const editor = await postingModel.findEditorByArticleID(articleID);

    const articleTags = await tagModel.findByArticleID(articleID);

    article.status = postingModel.checkStatusArticle(
        article.is_approved,
        article.published_date
    );

    switch (article.status) {
        case 'Chưa duyệt':
            article.isDraft = true;
            break;
        case 'Đã xuất bản':
            article.hasPublished_date = true;
            article.published_date = moment(article.published_date).format(
                'DD-MM-YYYY HH:mm '
            );
            break;
        case 'Chờ xuất bản':
            article.hasPublished_date = true;
            article.published_date = moment(article.published_date).format(
                'DD-MM-YYYY HH:mm '
            );
            article.canModifyDate = true;
            break;
        default:
            //"Bị từ chối"
            break;
    }

    const catList = await getAllExceptID(article.category_id);

    return res.json({
        result: true,
        article,
        articleTags,
        catList,
        author,
        editor,
    });
});

router.post('/posts/patch', async function (req, res) {
    const articleID = +req.query.articleID;

    const body = JSON.parse(decodeURI(req.query.body));
    const userID = +req.query.userID;

    //patch category
    if (body.category !== '-1') {
        await postingModel.patchCategory(articleID, body.category);
    }

    //add tag -add_tag
    let tagList = body.add_tag;
    if (tagList) {
        tagList = tagList.split('|');
    } else tagList = [];
    //console.log("taglist", tagList);
    postingModel.addTagList(tagList, articleID);

    //remove tag - delTagList
    if (body.delTagList !== undefined) {
        if (typeof body.delTagList === 'string') {
            let deleteList = [];
            deleteList.push(body.delTagList);
            await tagModel.delTagArticles(articleID, deleteList);
        } else {
            await tagModel.delTagArticles(articleID, body.delTagList);
        }
    }

    //patch publish_date
    if (body.modifiedPublished_date !== undefined) {
        const updatedDate = moment(
            body.modifiedPublished_date.trim(),
            'DD-MM-YYYY HH:mm',
            true
        ).format('YYYY-MM-DD HH:mm:ss');
        await postingModel.patchPublishDate(articleID, updatedDate);
        console.log('modify publish_date successfully');
    }

    //publish article
    if (
        body.published_date !== undefined &&
        body.published_date !== '__-__-____ __:__ '
    ) {
        const editorID = userID; //1;//replace with current adminID
        const publish_date = moment(
            body.published_date.trim(),
            'DD-MM-YYYY HH:mm',
            true
        ).format('YYYY-MM-DD HH:mm:ss');
        const approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
        await postingModel.addApproval(
            articleID,
            editorID,
            publish_date,
            approved_date
        );
        if (+body.isPremium === 1) {
            await postingModel.setPremium(articleID);
        }
        console.log('add approval successfully');
    }

    return res.json(true);
});

router.post('/posts/del', async function (req, res) {
    const articleID = +req.query.articleID;
    await postingModel.delArticle(articleID);
    return res.json(true);
});
module.exports = router;
