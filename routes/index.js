var express = require('express');
var router = express.Router();
var path = require('path');
var media = path.join(__dirname,'../public/media');
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
	fs.readdir(media,function (err,names) {
		if (err) {
			console.log(err);
		} else {
			//console.log(names);
  			res.render('index', { title: 'Music Player', music: names });
		}
	});
});

module.exports = router;
