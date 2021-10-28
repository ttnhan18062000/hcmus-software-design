const express = require('express');
const moment = require('moment');
const postingModel = require('../models/posting.model');
const tagModel = require('../models/tag.model');
const {getAllExceptID} = require('../models/category.model');
const {checkAuthenticated,isAdmin} = require('../models/user.model');


const router = express.Router();

router.get('/posts',checkAuthenticated,isAdmin,async function (req, res) {

    const articles = await postingModel.getArticleList();
    
    for(article of articles){
        article.status = postingModel.checkStatusArticle(article.is_approved,article.published_date);       
    }

    res.render('vwAdmin/posts', {
        layout: 'admin.hbs',
        postActive: true,
        articles
    });
})

router.get('/posts/edit',checkAuthenticated,isAdmin,async function (req, res) {
    const articleID = req.query.id;    
    const article = await postingModel.findByID(articleID);
    if(article === null){
        return res.redirect('/admin/posts');
    }
    
    const author = await postingModel.findAuthorByArticleID(articleID);
    
    const editor = await postingModel.findEditorByArticleID(articleID);
    
    
    const articleTags = await tagModel.findByArticleID(articleID);
    //console.log(articleTags);
    
    article.status = postingModel.checkStatusArticle(article.is_approved,article.published_date);       

    switch (article.status) {
        case "Chưa duyệt":
            article.isDraft = true;
            break;
        case "Đã xuất bản":
            article.hasPublished_date = true;
            article.published_date = moment(article.published_date).format("DD-MM-YYYY HH:mm ");
            break;
        case "Chờ xuất bản":
            article.hasPublished_date = true;
            article.published_date = moment(article.published_date).format("DD-MM-YYYY HH:mm ");
            article.canModifyDate = true;
            break;
        default:
            //"Bị từ chối"
            break
    }

    const catList = await getAllExceptID(article.category_id);
  
    res.render('vwAdmin/editPost', {
        layout: 'admin.hbs',
        postActive: true, 
        article,
        articleTags,
        catList,
        author,
        editor      
    });

});

router.post('/posts/patch',async function (req, res) {
    req.user.then(async(user) =>
    {
        
        const articleID = req.query.id;
        //console.log(req.body);
    
        //patch category
        if(req.body.category !== '-1'){       
            await postingModel.patchCategory(articleID,req.body.category);
        }
    
        //add tag -add_tag
        let tagList = req.body.add_tag;
        if (tagList){
            tagList = tagList.split('|');
        }
        else
            tagList = [];
        //console.log("taglist", tagList);    
        postingModel.addTagList(tagList, articleID);
    
        //remove tag - delTagList
        if(req.body.delTagList !== undefined){
            if(typeof(req.body.delTagList) === 'string'){
                let deleteList  = []
                deleteList.push(req.body.delTagList);
                await tagModel.delTagArticles(articleID,deleteList);
            }        
            else{
                await tagModel.delTagArticles(articleID,req.body.delTagList);
            }
        }
    
        //patch publish_date
        if(req.body.modifiedPublished_date !== undefined ){
            const updatedDate = moment(req.body.modifiedPublished_date.trim(),"DD-MM-YYYY HH:mm",true).format("YYYY-MM-DD HH:mm:ss");
            await postingModel.patchPublishDate(articleID, updatedDate);
            console.log("modify publish_date successfully");
        }
    
        //publish article
        if(req.body.published_date !== undefined &&  req.body.published_date !== '__-__-____ __:__ '){
            const editorID = user.id;//1;//replace with current adminID
            const publish_date = moment(req.body.published_date.trim(),"DD-MM-YYYY HH:mm",true).format("YYYY-MM-DD HH:mm:ss");        
            const approved_date = moment().format("YYYY-MM-DD HH:mm:ss"); 
            await postingModel.addApproval(articleID,editorID,publish_date,approved_date);
            if(+req.body.isPremium === 1){
                await postingModel.setPremium(articleID);
            }
            console.log("add approval successfully");
        }    
        
    
        res.redirect('/admin/posts');
    });

});

router.post('/posts/del',async function (req, res) {
    const articleID = req.query.id;
    console.log(articleID);   
    await postingModel.delArticle(articleID); 
    res.redirect('/admin/posts');
});
module.exports = router;