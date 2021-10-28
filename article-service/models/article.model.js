const db = require('../database/db');
const moment = require('moment');
module.exports = {
    all() {
        return db('articles');
    },

    async findByID(id) {
        const sqlArticle = `SELECT a.*, c.title as category_name, r.pen_name as author_name 
    FROM articles a, category c, approval ap, reporters r
    where a.id = ${id} and a.category_id = c.id and ap.article_id = a.id 
          and r.user_id = a.author_id and ap.is_approved=1 and ap.published_date <= CURDATE();`
        const rsArticle = await db.raw(sqlArticle);
        if (!rsArticle[0][0]) return null;
        const article = rsArticle[0][0];

        const sqlTags = `SELECT * from article_tags atag, tags t
    where atag.tag_id = t.id and atag.article_id = ${id}`
        const rsTags = await db.raw(sqlTags);
        article.tags = rsTags[0] || [];

        const sqlCmts = `SELECT c.*, u.name as user FROM users u, comments c 
    where c.article_id = ${id} and u.id = c.commenter_id`
        const rsCmts = await db.raw(sqlCmts);
        article.comments = rsCmts[0] || [];

        return article;
    },

    async addView(id, newView) {
        console.log('newView', newView);
        return db('articles').where('id', id).update({view_number: newView});
    },

    async getTopWeek() {
        const time = moment().subtract(7, 'days').format('YYYY/MM/DD');
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    WHERE created_time > '${time}' and a.category_id = c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    order by view_number desc
    limit 4`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },
    async getTopViews() {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    WHERE a.category_id = c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    order by view_number desc
    limit 10`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },
    async getMostRecent() {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    WHERE a.category_id = c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    order by created_time desc
    limit 10`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },
    async getTop10Cats() {
        const sql = `SELECT a.category_id as id, c.title as name FROM articles a, category c, approval ap
    WHERE a.category_id = c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    group by category_id, c.title
    order by count(a.id) desc
    limit 10`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },
    async getArticleOfTop10Cats(top10Cats) {
        const sql = (catID) => `SELECT a.id, a.title, a.created_time, a.thumbnail_image FROM articles a, approval ap
    WHERE a.category_id = ${catID} and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    order by created_time desc
    limit 1`
        await Promise.all(top10Cats.map(async(cat) => {
            const rs = await db.raw(sql(cat.id));
            cat.articles = rs[0];
        }));
        return top10Cats;
    },

    async getRandomArticlesFromCategory(catID, limit = 5) {
        const sql = `SELECT a.* FROM articles a, approval ap
    where category_id = ${catID} and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    ORDER BY RAND()
    LIMIT ${limit}`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    addComment({ content, article_id, post_time, commenter_id }) {
        return db('comments').insert({ content, article_id, post_time, commenter_id });
    },

    async getArticleTags(id) {
        const sqlTags = `SELECT * from article_tags atag, tags t
    where atag.tag_id = t.id and atag.article_id = ${id}`
        const rsTags = await db.raw(sqlTags);
        return rsTags[0] || [];
    },

    async findByCatID(catId, offset, limit) {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    where a.category_id = c.id and c.id = ${catId} and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    limit ${limit} offset ${offset}`;
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    async findByCatParentID(catId, offset, limit) {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c , approval ap
    where a.category_id = c.id and c.parent_id = ${catId}  and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    limit 6 offset ${offset}`;
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    async findByTagID(tagId, offset) {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, article_tags at, category c, approval ap
    where at.article_id = a.id and at.tag_id = ${tagId} 
        and c.id = a.category_id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    limit 6 offset ${offset}`;
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    async countByCatID(catId) {
        const rows = await db('articles')
            .where('category_id', catId)
            .count('*', { as: 'total' });

        return rows[0].total;
    },

    async countByCatParentID(catId) {
        const sql = `SELECT COUNT(*) as total FROM articles a, category c, approval ap
    where a.category_id = c.id and c.parent_id = ${catId} and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()`
        const rs = await db.raw(sql);
        return rs[0][0].total;
    },

    async countByTagID(tagId) {
        const sql = `SELECT COUNT(*) as total FROM  article_tags ats, approval ap
    where ats.tag_id = ${tagId} and ap.article_id=ats.article_id and ap.is_approved=1 and ap.published_date <= CURDATE()`;
        const rs = await db.raw(sql);
        return rs[0][0].total;
    },

    async search(kw) {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    where match(a.title, a.abstract, a.content) against('${kw}') 
    and a.category_id=c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE();`
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    async findBySearch(kw, offset) {
        const sql = `SELECT a.*, c.title as category_name FROM articles a, category c, approval ap
    where match(a.title, a.abstract, a.content) against('${kw}') 
    and a.category_id=c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE()
    limit 6 offset ${offset}`;
        const rs = await db.raw(sql);
        return rs[0] || [];
    },

    async countSearch(kw) {
        const sql = `SELECT COUNT(*) as total FROM articles a, category c, approval ap
    where match(a.title, a.abstract, a.content) against('${kw}') 
    and a.category_id=c.id and ap.article_id = a.id and ap.is_approved=1 and ap.published_date <= CURDATE();`
        const rs = await db.raw(sql);
        return rs[0][0].total;
    }

};