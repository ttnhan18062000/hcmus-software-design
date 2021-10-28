module.exports = function (app){
    //Đường dẫn final bằng app.use + router.get
    app.use('/', require('./controllers/category.route'));
}