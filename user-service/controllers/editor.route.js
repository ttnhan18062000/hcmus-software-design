const express = require('express');
const moment = require('moment');
const assignCatModel = require('../models/assignCat.model');
const postingModel = require('../models/posting.model');
const tagModel = require('../models/tag.model');
const userModel = require('../models/user.model');
const {checkAuthenticated,isEditor} = require('../models/user.model');

const router = express.Router();


router.get('/editorAssignedCat',checkAuthenticated,isEditor, function (req, res) {
         
    req.user.then(async(user)=>{        
        const editorID = user.id;
        const assignedCatList = await assignCatModel.findByEditorID(editorID);
        //console.log(assignedCatList);
        res.render('vwEditor/editorAssignedCat', {
            assignedCatList,
            assignedCat: true
        });
    });
    
})
router.get('/editorPostList',checkAuthenticated,isEditor,function (req, res) {    
          
    req.user.then(async (user)=>{        
        const editorID = user.id;
        let postList = await postingModel.findPostList(editorID);
        postList = postList.map((post) => {
            post.created_time = moment(post.created_time).format("HH:mm DD-MM-YYYY");
            return post;
        });
        //console.log(postList);
        res.render('vwEditor/editorPostList', {
            postList,
            wait: true
        });
    });    
})
router.get('/editorRejectedList',checkAuthenticated,isEditor,  function (req, res) {
           
    req.user.then(async (user)=>{        
        const editorID = user.id;
        let rejectedList = await postingModel.findRejectedList(editorID);
        rejectedList = rejectedList.map((post) => {
            post.approved_date = moment(post.approved_date).format("HH:mm DD-MM-YYYY");
            return post;
        });
        //console.log(rejectedList);
        res.render('vwEditor/editorRejectedList', {            
            rejectedList,
            rejected: true
        });
    });

})
router.post('/editorRejectedList/rejectReason', async function (req, res) {
   
    const rejectReason = req.body;
    const authorName = (await userModel.findByID(rejectReason.author_id)).name;
  
    res.render('vwEditor/editorRejectReason', {
        rejectReason,
        authorName,
        rejected: true
    });
})

router.get('/editorApprovedList',checkAuthenticated,isEditor, function (req, res) {
           
    req.user.then(async (user)=>{
        const editorID = user.id;
    
        //tìm bài đã duyệt 
        const articleList = await postingModel.findApprovedList(editorID);
        //console.log(articleList);
        const newArtList = articleList.map((art) => {
            art.status = postingModel.checkStatusArticle(1, art.published_date)
            art.published_date = moment(art.published_date).format("HH:mm DD-MM-YYYY");
            //console.log(art);
            return art;
        });
    
        
        res.render('vwEditor/editorApprovedList', {
            newArtList,
            approved: true
        });
    });

    
})

router.get('/editor', checkAuthenticated,isEditor, function (req, res) {
           
    req.user.then(async(user)=>{   
        const editorID =  user.id;    
        const articleID = req.query.id || 0;
        if(articleID !== 0){

            const article = await postingModel.findArticleByID(articleID);
        
            // const article = await articleModel.findByID(id);
            if (article===null) {
                return res.redirect('/editorPostList');
            }
            
            const authorInfor = await userModel.findByID(article.author_id);
            const authorPenname = await userModel.findPenNameByID(article.author_id)
    
            const author = {
                id: authorInfor.id,
                name: authorInfor.name,
                email: authorInfor.email,
                penname: authorPenname
            };
            //const catList = await getAllExceptID(article.cat_id);
            const articleTags = await tagModel.findByArticleID(articleID);
            const catList = await assignCatModel.getAllAssignedCatExceptID(editorID,article.cat_id)
            //console.log(test);
            res.render('vwEditor/editor',{          
                article,
                articleTags,
                catList,
                author
            });
        }
        else{
            res.redirect('/');
        }
    });    

})


router.post('/editor/approve', function (req, res) {
            
    req.user.then(async (user)=>{   
        const editorID = user.id;    
        const articleID = req.query.id || 0;
        
        if(articleID !== 0){

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
    
            //add into approval table
            const publish_date = moment(req.body.published_date.trim(),"DD-MM-YYYY HH:mm",true).format("YYYY-MM-DD HH:mm:ss");        
            const approved_date = moment().format("YYYY-MM-DD HH:mm:ss"); 
            await postingModel.addApproval(articleID,editorID,publish_date,approved_date);
            console.log("add approval successfully");
            if(+req.body.isPremium === 1){
                await postingModel.setPremium(articleID);
            }

            res.redirect('/editorPostList');
        }
        else{
            res.redirect('/');
        }
    });      
    
})

router.post('/editor/reject', function (req, res) {
           
    req.user.then(async (user)=>{  
        const editorID =  user.id;
            
        const articleID = req.query.id || 0;
    
        if(articleID !== 0){
        
        const rejectReason = req.body.reject_reason;
        const approved_date = moment().format("YYYY-MM-DD HH:mm:ss"); 
        await postingModel.addRejected(articleID,editorID,rejectReason,approved_date);

        res.redirect('/editorPostList');
        }
        else{
            res.redirect('/');
        }
    }); 
    
})





module.exports = router;