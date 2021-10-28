const db = require('../database/db');
const tagModel = require('../models/tag.model');
const moment = require('moment');

const addArticle = (article, tags) =>
{
    let tagList = tags;
    console.log("taglist", tagList);
    return db('articles').insert(article).then( articleID => {
        tagList.forEach(tag => {
            console.log(tag);
            let tagID = parseInt(tag);
            console.log(tag, articleID);
            tagModel.addTagArticles(tag, articleID).then(()=> console.log("add tag article"));
            // db.select("id")
            // .from("tags")
            // .where("tag_name", tag)
            // .then(async(tagList) => {
            //     if (tagList.length === 0) {
            //         await tagModel.add(tag)
            //         .then( async(tagId) => {
            //             console.log(tagId, articleID);
            //             await tagModel.addTagArticles(tagId, articleID).then(()=> console.log("add tag article"));
            //         });
            //     }
            //     else{
            //         console.log("add tag existed");                    
                    
            //         await tagModel.addTagArticles(tagList[0].id, articleID);
            //     }
            });
        });
};

const updateArticle = (article, tags, id) => {
    const tagArticles = tags.map((tag) => {
        return {"article_id": id, "tag_id": tag};
    });
    console.log(tagArticles);
    tagModel.delTagsByArticleID(id)
    .then(() => {
        
        tagModel.addTagArticlesList(tagArticles).then(() => {
            db('approval')
                .where({article_id: id})
                .del().then(() => {
                    console.log('delete approval')
                    return db('articles')
                        .where('id', id)
                        .update(article);
                })
        })
    })

}

const findArticleByAuthorID = (authorID) => {
    console.log('auid', authorID);
    return db('articles')
            .where('author_id', authorID)
            .leftJoin('approval', 'articles.id', 'approval.article_id')
            .leftJoin('category', 'articles.category_id', 'category.id')
            .leftJoin('category as parentCategory', 'category.parent_id', 'parentCategory.id')
            .select('articles.id', 'articles.title', 'articles.author_id', 'category.title as catTitle', 'approval.*', 'parentCategory.title as parentCatTitle');
}

const checkStatusArticle = (is_approved, published_date)=>{
    switch (is_approved){
        case null:
            return "Chưa duyệt";            
        case 0:
            return "Bị từ chối";
        case 1:
            const publishedDate = moment(published_date);
            const today = moment();
            const diffTime = publishedDate.diff(today);

            return diffTime <= 0? "Đã xuất bản": "Chờ xuất bản";            
    }
}

module.exports = {
    addArticle,
    checkStatusArticle,
    findArticleByAuthorID,
    updateArticle,
    getArticleList(){                           
        return db({a: 'articles'})
                .select('a.id','a.title','a.category_id',{cat_title:'c.title'},'c.parent_title','app.is_approved', 'app.published_date')
                .leftJoin({app: 'approval'},'app.article_id','=','a.id')
                .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                        .from({c1:'category'})
                        .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                        .as('c')
                        ,'c.id','=','a.category_id');              
    },

    getWaitingArticlesByAuthorID(authorID){
        return db({a: 'articles'})
            .select('a.id','a.title',{cat_title:'c.title'},'c.parent_title')
            .whereNotIn('a.id', db('approval')
                                .select('article_id')
                                )
            .andWhere('a.author_id',authorID)
            .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                    .from({c1:'category'})
                    .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                    .as('c')
                    ,'c.id','=','a.category_id');      
    },

    getRejectedArticlesByAuthorID(authorID){
        return db({a: 'articles'})
                .select('a.id','a.title',{cat_title:'c.title'},'c.parent_title')
                .join({app:'approval'},'app.article_id','=','a.id')
                .where('a.author_id',authorID)
                .andWhere('app.')
                .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                        .from({c1:'category'})
                        .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                        .as('c')
                        ,'c.id','=','a.category_id');      
    },

    async findByID(articleID){
        const rows = await db({a: 'articles'})
                            .select('a.id','a.title','a.category_id',{cat_title:'c.title'},'c.parent_title','app.is_approved', 'app.published_date')
                            .leftJoin({app: 'approval'},'app.article_id','=','a.id')
                            .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                                    .from({c1:'category'})
                                    .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                                    .as('c')
                                    ,'c.id','=','a.category_id')
                            .where('a.id',articleID)
        if(rows.length === 0){
            return null;
        }  
        return rows[0];
    },

    async getApproval(articleID){
        const rows = await  db('approval')
                            .where('article_id', articleID);
        if(rows.length === 0){
            return null;
        }  
        return rows[0];
    },

    async findArticleByID(articleID){
        const rows = await db({a: 'articles'})
                            .join(db.select({cat_id:'c1.id'},{cat_title:'c1.title'},{parent_title:'c2.title'})
                                    .from({c1:'category'})
                                    .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                                    .as('c')
                                    ,'c.cat_id','=','a.category_id'
                                    )                            
                            .where('a.id',articleID)
        if(rows.length === 0){
            return null;
        }  
        return rows[0];
    },

    async findArticleByID2(articleID){
        const rows = await db({a: 'articles'})
                            .join(db.select({cat_id:'c1.id'},{cat_title:'c1.title'},{parent_id:'c2.id'})
                                    .from({c1:'category'})
                                    .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                                    .as('c')
                                    ,'c.cat_id','=','a.category_id'
                                    )                            
                            .where('a.id',articleID)
        if(rows.length === 0){
            return null;
        }  
        return rows[0];
    },

    async findAuthorByArticleID(id){
        const rows = await db({a:'articles'})
                .select('u.id','u.name')
                .join({u: 'users'},'u.id','=','a.author_id')
                .where('a.id',id);
        return rows[0];
    },

    async findEditorByArticleID(id){
        const rows = await db({app:'approval'})
                        .select('u.id','u.name')
                        .join({u: 'users'},'u.id','=','app.editor_id')
                        .where('app.article_id',id);
        return rows[0];
    },

    patchCategory(articleID,catID){  
        return db('articles')
            .where( 'id', articleID)
            .update({category_id: catID});
    },
    
    patchPublishDate(articleID, updatedDate){
        return db('approval') 
                .where('article_id',articleID)
                .update({published_date:updatedDate})
    },

    addApproval(articleID,editorID,publish_date,approved_date){
        return db('approval')            
            .insert({
                article_id: articleID,
                editor_id: editorID,
                is_approved: 1,
                published_date: publish_date,
                approved_date: approved_date});
    },

    delApprovalByArticalID(articleID){
        return db('approval')
                .where({article_id: articleID})
                .del();
    },
    setPremium(articleID){
        return db('articles')
                .where('id',articleID)
                .update('is_premium',1)
    },

    addRejected(articleID,editorID,rejectReason,approved_date){
        return db('approval')            
            .insert({
                article_id: articleID,
                editor_id: editorID,
                is_approved: 0,
                reject_reason: rejectReason,
                approved_date: approved_date});
    },

    addTagList(tagList,articleID){        
        tagList.forEach(async tag => {
            console.log(tag);
            await db.select("id")
            .from("tags")
            .where("tag_name", tag)
            .then(async tagList => {
                if (tagList.length === 0) {
                    await tagModel.add(tag)
                    .then(async (tagID) => {
                        console.log(tagID[0], articleID);
                        await tagModel.addTagArticles(tagID[0], articleID).then(()=> console.log("add tag article"));
                        //tagModel.addTagArticles(tagId, articleID).then(()=> console.log("add tag article"));
                    });
                }
                else{
                    console.log("add tag existed");
                    console.log(tagList[0].id,articleID);
                    try {
                        await tagModel.addTagArticles(tagList[0].id, articleID);                        
                    } catch (error) {
                        console.log("existed");
                    }
                }
            });
        });
        return 0;
    },

    async delArticle(articleID){
        //del article tags
        await db('article_tags')
                .where( {article_id: articleID})               
                .del()
                .then(()=>{
                    console.log("del article tags");
                });

        //del approval
        await db('approval')
                .where({article_id: articleID})
                .del()
                .then(()=>{
                    console.log("del approval");
                })

        await db('comments')
                .where({article_id: articleID})
                .del()
                .then(()=>{
                    console.log("del comments");
                })
        
        //del article
        return await db('articles')
                .where({id: articleID})
                .del()
                .then(()=>{
                    console.log("del article");
                })
    },

    findApprovedList(editorID){
        return db({app: 'approval'})
        .select('app.article_id','a.title','a.category_id',{cat_title:'c.title'},'c.parent_title', 'app.published_date')
        .join({a: 'articles'},'app.article_id','=','a.id')
        .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                .from({c1:'category'})
                .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                .as('c')
                ,'c.id','=','a.category_id')
        .where('app.editor_id',editorID)
        .andWhere('app.is_approved',1);
    },

    findRejectedList(editorID){
        return db({app: 'approval'})
        .select('app.article_id','a.author_id','a.title','a.category_id',{cat_title:'c.title'},'c.parent_title', 'app.approved_date','app.reject_reason')
        .join({a: 'articles'},'app.article_id','=','a.id')
        .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                .from({c1:'category'})
                .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                .as('c')
                ,'c.id','=','a.category_id')
        .where('app.editor_id',editorID)
        .andWhere('app.is_approved',0);
    },

    findPostList(editorID){
        return db({ca: 'category_assignment'})
        .select('a.id','a.title','a.created_time','a.category_id',{cat_title:'c.title'},'c.parent_title')
        .join({a: 'articles'},'ca.category_id','=','a.category_id')
        .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                .from({c1:'category'})
                .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                .as('c')
                ,'c.id','=','a.category_id')
        .whereNotIn('a.id', db('approval')
                                .select('article_id')
                            )
        .where('ca.editor_id',editorID);
        
    }

};