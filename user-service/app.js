const express = require('express');
const morgan = require('morgan');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
//app.use(cookieParser());
app.use(flash());
app.use(session({
    name: 'sid',
    secret: 'my $%^secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 10,
        secure: false
    }
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/public'));

app.use('/module', express.static(path.join(__dirname, 'node_modules')))


app.use('/public', express.static(__dirname + '/public'));


app.use(express.urlencoded({ //Cho phép controller nhận dữ liệu do form gửi về
    extended: true
}));

require('./locals.mdw')(app);
require('./routes.mdw')(app);

const PORT = 5000;
app.listen(PORT, function() {
    console.log(`Online Newspaper Web App User Service listening at http://localhost:${PORT}`);
});