const Product = require("../models/product");
const Customer = require("../models/customer");
const Sales = require("../models/sales");

const mongoose = require("mongoose");
const { extendWith } = require("lodash");
mongoose.connect("mongodb://127.0.0.1:27017/custDB", {useNewUrlParser: true}); // connect to port 27017

// requiring the product model and creating new products
var products = [
    new Product({
        name:"Chihuahua",
        price: 0,
        rating: "8.5",
        details:"A very pleasant and playfull Chihuahua. It will surely make your day. Get free pet-food & pet-care products worth over $10.",
        imagePath:"/chi.jpeg",
        totalOrders: 0
    }),
    new Product({
        name:"Labrador",
        price: 89,
        rating: "9.5",
        details:"Labrador breed is the most popular dog breed, needs 50gms of food an day including proteins and some carbs. Pet care products worth $20 will be given free.",
        imagePath:"https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/labrador-puppy-royalty-free-image-1626252338.jpg?crop=0.667xw:1.00xh;0.173xw,0&resize=640:*",
        totalOrders: 0
    }),
    new Product({
        name: "Golden Retriever",
        price: 160,
        rating: "10",
        details:"A very fun pet to have! she is healthy and caring.",
        imagePath:"/gold.jpeg",
        totalOrders: 0
    }),
    new Product({
        name:"Rabbit babies",
        price:3,
        rating:"8.7",
        details:"Very cheerful and healthy rabbit, needs 3 carrots a day and some milk as its main daily diet.",
        imagePath:"/rabbit.jpeg",
        totalOrders: 0
    }),
    new Product({
        name:"Kittens",
        price:15,
        rating: "8.8",
        details:"Known for their cuteness, they are playful and fun to have around.Needs fish, milk and 1 egg a day.",
        imagePath:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT72BQC2k2WG5Na8MPobIRomuht3NXz-IHxQ&usqp=CAU",
        totalOrders: 0
    }),
    new Product({
        name:"Pomeranian",
        price:98,
        rating: "9.8",
        details:"Very playfull and aware pet, takes care of you and your home, needs 30gms dog meal a day.",
        imagePath:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQFcDkL45IuJXadf_rkWvRNwPBQ6c6ogW7qg&usqp=CAU" ,
        totalOrders: 0
    })
];

// save items to the database but we will have to stop the running after its done, so disconnect from mongoose when done.
// saving items to the database is asynchronous, so we will have to call the disconnnect properly at the end of the loop:


var done = 0;
products.forEach(function(product)
{
    product.save(function(err, result)
    {
        done++;
        if(done == products.length)
            exit();
    });
});


function exit()
{
    mongoose.disconnect();
}


