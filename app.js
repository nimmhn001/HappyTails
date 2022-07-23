
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
mongoose.connect("mongodb://127.0.0.1:27017/custDB", {useNewUrlParser: true}); // connect to port 27017
const app = express();
var csrf = require("csurf");
var session = require("express-session");
var passport = require("passport");
var flash = require("connect-flash");
var validator = require("express-validator");
var MongoStore = require("connect-mongo");

require("dotenv").config();
//--------------------------------------------------------------------------

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(validator());
// our current session as a javascript object
app.use(session(
{ secret:"supersecret",
  resave : false,
  saveUninitialized:false,
  store: MongoStore.create({mongoUrl:"mongodb://127.0.0.1:27017/custDB"}),
  cookie: {maxAge: 180 * 60 * 1000} // setting maxAge to 180 mins (expressed here as milliseconds as maxAge is in ms)
}));


app.use(passport.initialize());
app.use(passport.session());
var csrfProtection = csrf();
require("./config/passport");
app.use(csrfProtection);
app.use(flash());
var userRoutes = require("./routes/user"); //for all user routes 
const Product = require("./models/product");
const Customer = require("./models/customer");
const Order = require("./models/order");
const Cart = require("./models/cart");
const cart = require("./models/cart");
const Sales = require("./models/sales");
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb");
app.use('/user', userRoutes); // if prefix is '/user' go to userRoutes
app.use(function(req, res, next)
{
    res.locals.login = req.isAuthenticated(); //  "login" is the global variable here, it will be set to true/ false,
    res.locals.session = req.session;
    next(); 
});


//----------------------------------------------
var name = "";

//HOME ROUTE   
app.get('/', function(req, res)
{  
    var successMsg = req.flash('success')[0];

    if(res.locals.login === false)
    {
        Product.find({}, function(err, foundItems)
        {
            res.render("home" , {name:"Get to find your perfect pet!", items:foundItems, status:"Login/Sign Up", session: session, login: 0, successMsg: successMsg, cart: null});
        });
    }    
    else
    {    
        var cart = new Cart(req.session.cart ? req.session.cart: {});
        Product.find({}, function(err, foundItems)
        {
            var name;
            console.log(req.user);
            if(!req.user.isAdmin)
                name = "Welcome, "  + req.user.fname +  " !";
            else
                name = "Welcome"
            res.render("home", {name: name, items:foundItems, status: "View", login: 1, successMsg: successMsg, cart: cart});
        });
    } 

});

app.post('/', function(req, res)
{
   res.redirect("/");
});

// ------------------------------------------------------

// PRODUCTS PAGE:
app.get("/products", function(req, res)
{
    var success_msg = req.flash('success')[0];
    Product.find({},function(err, founditems)
    {
        res.render("items", {items: founditems, success_msg: success_msg, add : 0, token: req.csrfToken()});
    });
});

app.get("/remove/:id", function(req, res)
{
    var itemsId = req.params.id;
    Product.findById(itemsId, function(err, item)
    {
        console.log("item - >", item);
        Product.deleteOne({name: item.name}).then(function(){
            console.log("Data deleted"); // Success
        }).catch(function(error){
            console.log(error); // Failure
        });
    });
    req.flash("success", "Product Removed");
    res.redirect("/products");
});

app.get("/products/add", function(req, res)
{
    Product.find({},function(err, founditems)
    {
        res.render("items", {items: founditems, success_msg: "", add : 1, token: req.csrfToken()});
    });
});

app.post("/products/add", function(req, res)
{
    const newProduct = new Product({
        name: _.capitalize(req.body.name),
        price: req.body.price,
        rating: req.body.rating,
        details: req.body.desc,
        imagePath: req.body.img,
        totalOrders: 0
    });
    newProduct.save();
    req.flash("success", "Product Added");
    res.redirect("/products");
});

app.get("/editproduct/:Itemid", function(req, res)
{
    var id = req.params.Itemid;
    Product.findById(id, function(err, found)
    {
        res.render("editProduct", {product: found, token: req.csrfToken()});
    })
    
});

app.post("/editproduct/:Itemid", function(req, res)
{
    var id = req.params.Itemid;
    var newName = req.body.name;
    var newdesc = req.body.desc;
    var newp = req.body.price;
    var newrat = req.body.rating;
    var img = req.body.img;
    Product.findByIdAndUpdate(id, {$set: {name: newName, price: newp, details: newdesc, rating: newrat, imagePath: img}}, {new: true}, function(err, found){});
    req.flash("success", "Product details updated");
    res.redirect("/products");
});


//------------
// to get the random page with products
app.get("/products/:itemId", function(req, res)
{
    const itemId = req.params.itemId;
    Product.findOne({_id: itemId}, function(err, foundItem)
    {
        if(!err)
        {
            res.render("product", {item:foundItem, cart: req.session.cart});
        }
        else
            console.log(err);
    });

});

// CART PAGE

app.get("/shopping-cart", function(req, res, next)
{
    if(!req.session.cart)
    {
        return res.render("cart", {cartItems:null, cart: null, login: res.locals.login, token: req.csrfToken()});
    }
    var cart = new Cart(req.session.cart);
    res.render("cart", {cartItems:cart.generateArray(), totalPrice:cart.totalPrice, cart: cart, login : true, token: req.csrfToken()});
});

app.get("/cart/:id", function(req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    Product.findById(productId, function(err, product)
    {
        if(err)
        {
            return res.redirect("/");
        }
        cart.add(product, productId);
        req.session.cart = cart;
        res.redirect("/shopping-cart");
    })
});



// adding and removing elements from cart
app.get("/reduce/:id", function(req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});

app.get("/add/:id", function(req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    Product.findById(productId, function(err, product)
    {
        if(err)
        {
            return res.redirect("/");
        }
        cart.add(product, productId);
        req.session.cart = cart;
        res.redirect("/shopping-cart");
    })
});

app.post("/qty/:id", function(req, res)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    var qty = req.body.quantity;
    Product.findById(productId, function(err, product)
    {
        if(err)
        {
            return res.redirect("/");
        }
        cart.set(product, productId, qty);
        req.session.cart = cart;
        res.redirect("/shopping-cart");
    });
});

app.get("/delete/:id", function(req, res, next)
{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    cart.delete(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});


// place order

app.get("/checkout", isLoggedIn, function(req, res, next)
{
    if(!req.session.cart)
        return res.redirect("/shopping-cart");
    var cart = new Cart(req.session.cart);
    var arr = [];
    arr = cart.generateArray();
    arr.forEach(function(item)
    {
        let cnt = 0;
        cnt = item.item.totalOrders + item.qty;
        Product.findOneAndUpdate({name : item.item.name}, {$set: {totalOrders: cnt}}, {new: true}, function(err, result){console.log("prodcts - > ", result)});
    });
    let orders_cnt = req.user.orders;
    Customer.findByIdAndUpdate(req.user._id, {$set: {orders: 1 + orders_cnt}}, {new: true}, function(err, updated)
    {
        console.log("updated - > ", updated);
    });
    var errmsg = req.flash('error')[0];
    res.render("checkout", {total: cart.totalPrice, errmsg: errmsg, token: req.csrfToken()});
});

app.post("/checkout", isLoggedIn, function(req, res, next)
{
    if(!req.session.cart)
        return res.redirect("/shopping-cart");
    var cart = new Cart(req.session.cart);
    var order = new Order({
        user: req.user, // passport stores the user inside request under the field "user"
        cart: cart,
        address: req.body.address,
        name: req.body.name
    });
    var arr = [];
    arr = cart.generateArray();
    Sales.findOne({name: "sales"}, function(err, sales_rec)
    {   
        if(err)
            console.log(err);
        var sales;
        var id;
        let best = 0;
        var best_selling  = {};
        sales = sales_rec;
        id = sales_rec._id;
        sales.totalSales += cart.totalPrice;
        sales.totalOrders += cart.totalQty;
        if(sales.bestSelling)
            best = sales.bestSelling.totalOrders;
        best_selling = sales.bestSelling;
        arr.forEach(function(item)
        {
           Product.findOne({name: item.item.name}, function(err, foundItem)
           {
                if(err)
                    console.log(err);
                else if(best < foundItem.totalOrders)
                {
                    best = foundItem.totalOrders;
                    best_selling = foundItem;
                    Sales.findByIdAndUpdate(id, {$set: {totalOrders: sales.totalOrders, totalSales: sales.totalSales, bestSelling: best_selling}},  {new: true}, function(err, output){});
                }
           });
          
        });
    });
    // saving the order to the database
    order.save(function(err, result)
    {
        if(err)
            return res.redirect("/checkout");
        req.flash("success", "Order Placed Sucessfully!");
        req.session.cart = null;
        res.redirect("/");
    });  
});
   


function isLoggedIn(req, res, next)
{
    if(req.isAuthenticated())
    {
       return next(); // next() is like saying to continue
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function()
{
    console.log("server has started on port 3000");
});


















