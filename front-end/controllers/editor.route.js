const express = require('express');
const {checkAuthenticated,isEditor} = require('../models/user.model');

const router = express.Router();

const {HTTP} = require('http-call');
const userURL = require('../../configs/services-url.json')['user-service'];

router.get('/editorAssignedCat',checkAuthenticated, isEditor, async function (req, res) {
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editorAssignedCat?user=' + JSON.stringify(user)));
    return res.render('vwEditor/editorAssignedCat', data);
})

router.get('/editorPostList',checkAuthenticated, isEditor, async function (req, res) {  
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editorPostList?user=' + JSON.stringify(user)));
    return res.render('vwEditor/editorPostList', data);  
})

router.get('/editorRejectedList',checkAuthenticated,isEditor, async  function (req, res) {
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editorRejectedList?user=' + JSON.stringify(user)));
    return res.render('vwEditor/editorRejectedList', data);
})

router.post('/editorRejectedList/rejectReason', async function (req, res) {
    const rejectReason = req.body;
    const {body: data} = await HTTP.post(encodeURI(userURL + '/editorRejectedList/rejectReason?rejectReason=' + JSON.stringify(rejectReason)));
    return res.render('vwEditor/editorRejectReason', data);
})

router.get('/editorApprovedList',checkAuthenticated,isEditor, async function (req, res) {
    const user = await req.user.then((user) => user);
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editorApprovedList?user=' + JSON.stringify(user)));
    return res.render('vwEditor/editorApprovedList', data);
})

router.get('/editor', checkAuthenticated,isEditor, async function (req, res) {
    const user = await req.user.then((user) => user);
    const articleID = req.query.id || 0;
    const {body: data} = await HTTP.get(encodeURI(userURL + '/editor?user=' + JSON.stringify(user) + "&articleID=" + articleID));
    if (data === true)
        return res.redirect('/editorPostList');
    else if (data === false)
        return res.redirect('/');  
    else  
        return res.render('vwEditor/editor', data);
})


router.post('/editor/approve', async function (req, res) {
    const user = await req.user.then((user) => user);
    const articleID = req.query.id || 0;
    const {body: data} = await HTTP.post(encodeURI(userURL + '/editor/approve?user=' + JSON.stringify(user) + "&articleID=" + articleID));
    if (data === true)
        return res.redirect('/editorPostList');
    else{
        return res.redirect('/');
    }    
})

router.post('/editor/reject', async function (req, res) {
    const user = await req.user.then((user) => user);
    const articleID = req.query.id || 0;
    const {body: data} = await HTTP.post(encodeURI(userURL + '/editor/reject?user=' + JSON.stringify(user) + "&articleID=" + articleID));
    if (data ===  true)
    return res.redirect('/editorPostList');
    else{
        return res.redirect('/');
    }
})





module.exports = router;