const categoryModel = require('../models/category.model');

module.exports = function(app){
    app.use(async function(req,res,next){
        // const categories = await categoryModel.all();
        // const mainCategories = await categoryModel.allMainCategories();
        // for(c of mainCategories){
        //     const subCat = await categoryModel.findByParentID(c.id);
        //     c.subCat = subCat;
        // }
        
        // res.locals.lcCategories = categories;
        // res.locals.lcMainCategories = mainCategories;
        // next();
        const categories = await categoryModel.all();
        const mainCategories = await categoryModel.allMainCategories();
        for(c of mainCategories){
            const subCat = await categoryModel.findByParentID(c.id);
            c.subCat = subCat;
        }
        
        res.locals.lcCategories = categories;
        res.locals.lcMainCategories = mainCategories;
        res.locals.currentUser = await req.user;
        if(typeof(res.locals.currentUser) !== 'undefined' ){
            if(res.locals.currentUser.user_type ===1 ){
                res.locals.isWriter = true;
            }
            else if(res.locals.currentUser.user_type === 2 ){
                res.locals.isEditor = true;
            }
            else if(res.locals.currentUser.user_type === 3 ){
                res.locals.isAdmin = true;
            }
        }

        next();
    })
}