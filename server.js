var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user');

var port = process.env.PORT || 3000;

app.set('superSecret',config.secret);

app.use(bodyParser.urlencoded({extended :false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
mongoose.connect(config.database);


app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port);
});

app.post("/authenticate",function(req,res){
console.log(req.body);
  User.findOne({name:req.body.name},function(err,user){
if(err){
  console.log(err);
}
if(!user){
  res.json({success:false ,message:"Authentication failed ,user not found"})
}else if(user){

if(user.password !==req.body.password){
  res.json({success:false ,message:"Authentication failed ,wrong password"})

}else{
  var token =jwt.sign(user,app.get("superSecret"),{
    expiresIn : '24h'
  });

  res.json({success:true,message:"user authenticated",token:token});
}

}

  });
});

//using middleware to authenticate the user request before giving the access to API
app.use(function(req,res,next){
  var token =req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token,app.get('superSecret'),function(err,decoded){
if(err){
  return res.json({success:false ,message:"Invalid request ,failed to authenticate token"});
}else{
  req.decoded =decoded;
  next();
}

    })
  }else{
    res.redirect("/")
  }
});

app.get('/sample',function(req,res){
var nick =new User({
name:"vikash kumar",
password :'ervikash',
admin:true
});
nick.save(function(err){
  if(err){
    console.log("failed",err);
    return;
  }
  console.log("user saved successfully");
  res.json({success:true});
})

app.get("/users",function(req,res){
User.find({},function(err,users){
console.log(users);
res.json(users);

})

})



});

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
