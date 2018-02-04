var express = require('express');
var axios = require('axios');
var multer = require('multer');
var fileValidation = true;
var date = new Date().toString();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.studentnumber + "_" + date + "_timetable"+".png")
    }
});

var app = express();
var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb){
    if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== ""){
      fileValidation = false;
      return cb(null, false);
    }
      cb(null, true);
    },
  limits: {filesize: 1024 * 1024}
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://MIRO2018:it244miro2018@ds117858.mlab.com:17858/miro2018', function(req, res){
  console.log('We are Connected!')
});
mongoose.Promise = global.Promise;

var static = require('serve-static');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/src'));

var ejs = require('ejs');
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const Apply = require('./models/apply');

app.get('/', function(req, res){
  res.render('bbb00.ejs');
});



app.post('/applyMiro', upload.single('timetable'), function(req, res){
  if(req.body.checking !== "확인"){
    res.render('check.ejs',{checking:true, appliedChecking:false, wrongFile:false, applyCom:false});
  } else{
    var att = (req.body.attendance === "atten") ? "재학" : "휴학";
    console.log(req.body);
    if(fileValidation !== false){
      const apply = new Apply({
        name: req.body.name,
        major: req.body.major,
        studentnumber: req.body.studentnumber.toString(),
        grade: req.body.grade.toString()+"학년",
        attendance: att,
        motive: req.body.motive,
        phonenumber: req.body.phonenumber.toString()
      });
      Apply.find({studentnumber: req.body.studentnumber}, function(err, result){
        if(err) {
          throw err;
        }
        else {
          if(result.length > 0){
            res.render('check.ejs',{checking:false, appliedChecking:true, wrongFile:false, applyCom:false});
          }
          else{
            apply.save(function(err){
              if(err){
                throw err;
              }
              else {
                res.redirect('/check')
              }
            })
          }
        }
      })
    }else{
      res.render('check.ejs',{checking:false, appliedChecking:true, wrongFile:false, applyCom:false});
    }
  }
});

app.get('/check', function(req, res){
  res.render('check.ejs',{checking:false, appliedChecking:false, wrongFile:false, applyCom:true});
});

app.get('/applycheck', function(req, res){
  res.render('applycheck.ejs');
});

app.post('/showApply', function(req, res){
  Apply.find({studentnumber: req.body.studentnumber}, function(err, result){
    if(err) throw err;
    if(result.length > 0){
      res.json({success: true,
                name: result[0].name,
                major: result[0].major,
                atten: result[0].attendance,
                studentnumber: req.body.studentnumber,
                grade: result[0].grade,
                phonenumber: result[0].phonenumber,
              });
    } else{
      res.json({success: false});
    }
  });
});

app.post('/closeWin', function(rea, res){
  res.write('<script>window.close()</script>')
})

app.listen(3000, function(req, res){
  console.log('Server is Working.');
});
