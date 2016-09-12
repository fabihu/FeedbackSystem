var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');

/* GET home page. */
router.get('/', function(req, res, next) {
  dbhandler.init();
  res.render('login', { title: 'Express' });
})


module.exports = router;
