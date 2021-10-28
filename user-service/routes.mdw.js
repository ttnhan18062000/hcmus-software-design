module.exports = function (app){
    //Đường dẫn final bằng app.use + router.get
    app.use('/user', require('./controllers/user.route'));
    app.use('/', require('./controllers/writer.route'));
    app.use('/', require('./controllers/editor.route'));
}