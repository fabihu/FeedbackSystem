var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	console.log('redirecting to eval');
  
   return res.render('eval.ejs');
});

module.exports = router;
