var express     = require('express');
var router      = express.Router();
var app         = express();
var MongoClient = require('mongodb').MongoClient;
var url         = 'mongodb://chris:pass@ds137019.mlab.com:37019/blog-entries';

var title;
var pages;
var site;
var page;
app.locals.updateBlog;
var updateBlog;

getPages();
getSiteInfo();
getPage();


function getUpdateBlog() {
	exports.route = function(req, res){
    	updateBlog = req.app.locals.updateBlog;
    	console.log(updateBlog);
	}
}

function getPages() {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db('blog-entries');
	  dbo.collection('pages').find({}).toArray(function(err, result) {
	    if (err) throw err;
	    pages = result
	    db.close();
	  });
	});
}

function getPage() {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db('blog-entries');
	  dbo.collection('pages').findOne({id: 5}, function(err, result) {
	    if (err) throw err;
	    page = result
	    db.close();
	  });
	});
}

function getSiteInfo() {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db('blog-entries');
	  dbo.collection('site-settings').find({}).toArray(function(err, result) {
	    site = result[0]
	    db.close();
	  });
	});
}



/* GET home page. */
router.get('/', function(req, res, next) {
	getPages()
	getSiteInfo()
	getPage()
	getUpdateBlog()
	res.render('update', {
		page_title: page.page_title,
		page_content: page.page_content,
		page_image: page.image,
		page_pages: pages,
		page_link: page.page_link,
		site_lang: site.site_lang,
		site_name: site.site_name,
		site_root_url: site.site_root_url,
		site_favicon_url: site.site_favicon_url,
		site_logo_url: site.site_logo_url,
	})
});

module.exports = router;