var passport = require('passport');
var Customer = require("../models/customer");
const Product = require("../models/product");
const _ = require("lodash");
var localStrategy = require("passport-local").Strategy;


// tells passport how to store the user in this session
passport.serializeUser(function(customer, done)
{
    done(null, customer._id); // whenever it wants to store the user in the session, serialise it by id.

});

passport.deserializeUser(function(id, done)
{
    Customer.findById(id, function(err, customer)
    {
        done(err, customer);
    });
   
});

//  USER SIGN UP
passport.use("local.signup", new localStrategy({
    usernameField: "username",
    passwordField:"password",
    passReqToCallback:true              // passing request to callback func
},
function(req, username, password, done)
{
    req.checkBody('username', 'Invalid username, use a minimum of 4 charachters').isLength({min:4});
    req.checkBody('password', 'Invalid password, use a minimum of 4 charachters').isLength({min:4});
    var errors = req.validationErrors();
    if(errors)
    {   
        var messages = [];
        errors.forEach(function(error)
        {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Customer.findOne({'uname': username}, function(err, user)
    {
        if(err)
            return done(err);
        if(user)
            return done(null, false, {message: "Username is already in use."});
        // else create new user
        var newUser = new Customer();
        var fname = req.body.fname;
        var lname = req.body.lname;
        fname = _.capitalize(fname);
        lname = _.capitalize(lname);
        console.log("fname - >", fname);
        console.log("lname - >", lname);
        let newName = fname + lname;
        if(lname)
            newUser.name = fname + " " +  lname;
        else
            newUser.name = fname; 
        console.log("name - > ", newName);
        newName = _.toLower(newName);
        console.log("name - > ", newName);
        for(let i = 0; i < newName.length; i++)
        {
            console.log(newName[i]);
            if(!(newName[i] >= 'a' && newName[i] <= 'z'))
            {
                return done(null, false, {message: "Invalid entry in the name field"});
            }
        }   
        newUser.fname = fname;
        newUser.lname = lname;
        newUser.uname = username;
        newUser.pwd = newUser.encryptPassword(password);
        newUser.orders = 0;
        newUser.cart = null;
        newUser.save(function(err, result)
        {
            if(!err)
            {
                return done(null, newUser);
            }
            else
                done(err);
        });
    });

}));

// USER SIGN IN

passport.use("local.signin", new localStrategy({
    usernameField: "username",
    passwordField:"password",
    passReqToCallback:true              // passing request to callback func
},
function(req, username, password, done)
{
    req.checkBody('username', 'Invalid username, use a minimum of 4 charachters').isLength({min:4});
    req.checkBody('password', 'Invalid password, use a minimum of 4 charachters').isLength({min:4});
    var errors = req.validationErrors();
    if(errors)
    {   
        var messages = [];
        errors.forEach(function(error)
        {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Customer.findOne({'uname': username}, function(err, user)
    {
        //console.log(user);
        if(user.isAdmin)
            return done(null, user);
        if(err)
            return done(err);
        if(!user)
            return done(null, false, {message: "No user found."});
        if(!user.validPassword(password))
        {
            return done(null, false, {message:"Incorrect password"});
        }
        return done(null, user);
    });

}));