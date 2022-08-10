
// all user related routes
const localeCompare = require("locale-compare");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const compare = localeCompare();
const app = express();
var csrf = require("csurf");
const ejs = require("ejs");
app.set("view engine", "ejs");
var passport = require("passport");
const { Router } = require("express");
var csrfProtection = csrf();
var bcrypt = require("bcryptjs");
app.use(csrfProtection);
app.use(bodyParser.urlencoded({extended : true}));
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require("../models/cart");
const customer = require("../models/customer");
const Sales = require("../models/sales");
const { ConnectionClosedEvent, Admin } = require("mongodb");

// admin routes:
app.get("/admin", function(req, res)
{
    Sales.findOne({name: "sales"}, function(err, sales)
    {
        res.render("admin", {sales: sales} );
    })
});

app.get("/sortOrder", function(req, res)
{
    customer.find({}, function(err, users)
    {
        users.sort(function(a, b)
        {
            return b.orders - a.orders;
        });
        console.log(users);
        if(!err)
            res.render("users", {users: users, arr: [], token: req.csrfToken(), flag : 1});
    });
});

app.get("/sortName", function(req, res)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://127.0.0.1:27017/custDB";
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("custDB");
    //Sort the result by name:
    var sort = { name: 1 };
    dbo.collection("customers").find().sort(sort).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    db.close();
    res.render("users", {users: result, arr: [], token: req.csrfToken(), flag : 1});
    });
    });
});

app.get("/users", function(req, res)
{
    customer.find({}, function(err, users)
    {
        if(!err)
            res.render("users", {users: users, arr: [], token: req.csrfToken(), flag : 1});
    });
    
});

app.post("/users", function(req, res, next)
{
    var name = _.capitalize(req.body.inputName);
    var fname = "", lname = "";
    var i = 0;
    var st;
    while(i < name.length && name[i] != ' ')
    {
        i++;
    }
    fname = name.substr(0, i);
    i++;
    st = i;
    while(i < name.length && name[i] == ' ')
    {
        st = i;
        i++;
    } 
    while(i < name.length)
    {
        i++;
    }
    if(st < name.length)
        lname = _.capitalize(name.substr(st, i - st));
    if(lname)
        name = fname + " " + lname;
    var arr = [];
    customer.find({}, function(err, users)
    {   
        users.forEach(function(user)
        {
            if(user.name == name || user._id == name)
            {
                arr[user._id] = 1;
                done = 1;
            }
            else
            {
                if(user.fname != "" && (user.fname === fname || user.lname === fname))
                    arr[user._id] = 1;
                if(user.lname && (user.lname === fname || user.lname === lname))
                    arr[user._id] = 1;
            }
        });
        res.render("users", {users: users, arr: arr, token: req.csrfToken(), flag: 0});
    });
});

app.get("/orders", function(req, res){
    Order.find({}, function(err, orders)
    {
        //console.log(orders);
        if(!err)
            res.render("order", {orders: orders});
    });
});

app.get("/edit",  function(req, res, next){
    var msg = req.flash('error')[0];
    res.render("signup", {token : req.csrfToken(), message:"", login: "Edit Details", route: "/user/edit", message: msg});
  });
  
  app.post("/edit", function(req, res, next)
  {
    var newName = "";
    var newpwd = req.body.password;
    var newUname = req.body.username;
    var fname = req.body.fname;
    var lname = req.body.lname;
    newName = fname;
    if(!newName|| !newUname || !newpwd || newUname.length < 4 || newpwd.length < 4)
    {
        req.flash('error', 'Invalid entry, use atleast 4 charachters for username & password');
        return res.redirect('/user/edit');
    } 
    newpwd = req.user.encryptPassword(newpwd);
    fname = _.capitalize(fname);
    lname = _.capitalize(lname);
    if(lname)
       newName = fname + " " +  lname;
    else
        newName = fname;
    let new_name = fname + lname;
    new_name = _.toLower(new_name);
    for(let i = 0; i < new_name.length; i++)
    {
        if(!(new_name[i] >= 'a' && new_name[i] <= 'z'))
        {
            req.flash('error', 'Invalid entry in the name field');
            return res.redirect('/user/edit');
        }
      
    }  
    customer.findOne({uname: newUname}, function(err, foundperson)
    {
        if(err)
            console.log(err);
        else
        {
            var foundid = "";
            var thisid = "";
            if(foundperson)
                foundid += foundperson._id;
            thisid += req.user._id;
            if(!foundperson || (foundid == thisid))
            {
                customer.findByIdAndUpdate(req.user._id, {$set: {name: newName, uname: newUname, pwd: newpwd, fname: fname, lname: lname}}, {new: true},  function(err, result){});
                res.redirect("/user/profile");
            }
            else if(foundperson._id != req.user._id)
            {
                req.flash('error', 'Username is already in use.');
                res.redirect('/user/edit');
            }
        } 
    });
  });
  




//-----------------------------------------------------------------------------------------------
app.get("/success",function(req, res)
{
    res.render("success", {token:req.csrfToken()});
});
app.post("/success", function(req, res)
{
   res.redirect("/user/profile");
});

app.get("/profile", isLoggedIn, function(req, res, next)
{
    if(req.user.isAdmin)
        res.redirect("/user/admin")
    Order.find({user:req.user}, function(err, orders)
    {
        if(err)
            return res.write("Error!");
        else
        {
            var cart;
            orders.forEach(function(order)
            {
                cart = new Cart(order.cart); // create a new cart for each order so that we can use generate Array method of cart and print the list of ordered items by this user
                order.items = cart.generateArray(); // returns an array of items in the cart and stores itn in a filed called "items" in the order variable
            })
            res.render("profile", {login:true, orders: orders, user: req.user, cart: req.session.cart});
        }
    });
});

app.get("/logout", isLoggedIn, function(req, res, next)
{
    customer.findOneAndUpdate({uname: req.user.uname}, {$set: {cart: req.session.cart}}, function(err, result)
    {
        if(!err)
            console.log("FINE");
    });
    req.session.cart = null;
    req.logout(); //  a function by passport
    res.redirect("/");
});

// above are the routes which only a logged-in user can get into

app.use("/", notLoggedIn, function(req, res, next){
    next();
});


app.get("/signup", function(req, res, next)
{
    var msg = req.flash('error');
    res.render("signup", {token : req.csrfToken(), message:msg, login: "Sign Up", route: "/user/signup", links: "Already have an account?", link_route: "signin"});
});

// signup page via passport authentication
app.post("/signup", passport.authenticate("local.signup", 
{
    failureRedirect:"/user/signup",
    failureFlash:true
}),function(req, res, next)
{
    if(req.session.oldUrl)
    {
        res.redirect(req.session.oldUrl);
        req.session.oldUrl = null;
    }
    else
        res.redirect("/user/profile");
});

// USER SIGN IN
app.get("/signin", function(req, res, next)
{
    var msg = req.flash('error');
    res.render("signup", {token : req.csrfToken(), message:msg, login: "Login", route: "/user/signin", links: "Don't have an account? Create one", link_route: "signup"});
});

// via passport authentication
app.post("/signin", passport.authenticate("local.signin", 
{
    failureRedirect:"/user/signin",
    failureFlash:true
}), function(req, res, next)
{
    if(req.user.isAdmin)
        res.redirect("/user/admin");
    else
    {
        req.session.cart = req.user.cart;
        if(req.session.oldUrl)
        {
            res.redirect(req.session.oldUrl);
            req.session.oldUrl = null;
        }
        else
            res.redirect("/user/profile");
    }
});

app.get("/failure", function(req, res)
{
    console.log(req.flash('error'));
    res.render("signup", {token : req.csrfToken(), message:req.flash('error')});
});







module.exports = app;

//isAuthenticated is a function by passport which will be true if the user has succesfully logged in and false otherwise.
function isLoggedIn(req, res, next)
{
     console.log(req.body);
    if(req.isAuthenticated())
    {
       return next(); // next() is like saying to continue
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next)
{
    if(!req.isAuthenticated())
    {
       return next(); // next() is like saying to continue
    }
}

