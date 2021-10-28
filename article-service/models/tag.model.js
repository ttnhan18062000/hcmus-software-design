const db = require('../database/db');
const { findByUsername } = require('./user.model');

module.exports = {  

    all() {
        return db.select().from('tags');
    },
  
    add(tag) {
        return db('tags').insert({tag_name: tag});
    },    
    
    async findByID(id){
        const rows = await db('tags')
                    .where('id',id);
        if(rows.length === 0){
            return null;
        }
    
        return rows[0];
    },

    patch(tag){
        const id = tag.id;
        delete tag.id;
        
        return db('tags')
            .where( 'id', id)
            .update(tag);
    },

    async del(id){
        //del article tag
        await db('article_tags')
                .where('tag_id',id)
                .del()
                .then(()=>{
                    console.log("del article tag before del tag");
                })


        //del tag
        return db('tags')
            .where( 'id', id)
            .del();
    },

    findByName(name){
        return db('tags').select('id').where('tag_name', name);
    },

    addTagArticles(tagID, articleID){
        return db('article_tags').insert({tag_id: tagID, article_id: articleID});
    },
    addTagArticlesList(tagArtList){
        return db('article_tags').insert(tagArtList);
    },

    delTagArticles(articleID,delList){
        return db('article_tags')
             .where( {
                article_id: articleID              
              })
              .whereIn('tag_id',delList)
             .del();
    },
    delTagsByArticleID(articleID){
        return db('article_tags')
             .where( {
                article_id: articleID              
              })
              .del();

    },

    findByArticleID(articleID){
        return db({a: 'article_tags'})
                .join({t:'tags'},'a.tag_id','=','t.id')
                .where('a.article_id',articleID);
    }
};