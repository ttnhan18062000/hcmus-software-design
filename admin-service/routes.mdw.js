module.exports = function (app){
    //Đường dẫn final bằng app.use + router.get
    app.use('/admin', require('./controllers/admin_admin.route'));
    app.use('/admin', require('./controllers/admin_editor.route'));
    app.use('/admin', require('./controllers/admin_user.route'));
    app.use('/admin', require('./controllers/admin_writer.route'));
    app.use('/admin', require('./controllers/admin_category.route'));
    app.use('/admin', require('./controllers/admin_tag.route'));
    app.use('/admin', require('./controllers/admin_post.route'));
}