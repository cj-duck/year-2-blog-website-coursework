var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var allBlogsRouter = require('./routes/allBlogs');
var updateRouter = require('./routes/update');

var url = 'mongodb://chris:pass@ds137019.mlab.com:37019/blog-entries';
var app = express();
var bodyParser  = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

var db;
var updateBlog;

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

// Saving a blog entry:
MongoClient.connect(url, (err, client) => {
  if (err) return console.log(err)
  db = client.db('blog-entries')
  app.listen(3000, () => {
    console.log('Connected to Mongo')
  })
})

app.post('/blogs', (req, res) => {
    db.collection('blog-entries').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
})

// Deleting a blog entry
app.post('/delete/:id', (req, res) => {
    db.collection('blog-entries').remove({_id: (req.params.id)}, (err, result) => {
      if (err) return console.log(err)
      console.log("Entry Deleted")
      res.redirect('/allBlogs')
    })
})


// Update a blog entry
app.post('/update/:id', (req, res) => {
    console.log(req.params.id);
    db.collection('blog-entries').findOne({_id: ObjectID(req.params.id)}, (err, result) => {
      app.locals.updateBlog = result;
      res.redirect('/update')
  })
})

app.post('/updateBlog', (req, res) => {
    console.log(app.locals.updateBlog)
    var blog = app.locals.updateBlog
    var blogid = blog._id
    db.collection('blog-entries').remove({_id: blog._id}, (err, result) => {
      if (err) return console.log(err)
    })  
    db.collection('blog-entries').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('Entry Updated')
    })
    res.redirect('/allBlogs')
  })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/allBlogs', allBlogsRouter);
app.use('/update', updateRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

